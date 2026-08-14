import { NextResponse } from "next/server";

type DatasetRow = Record<string, unknown>;

type VisualizationRequest = {
  rows: DatasetRow[];
  columnAnalysis?: {
    name: string;
    dataType: string;
  }[];
};

type ChartPoint = {
  label: string;
  value: number;
};

type Visualization = {
  id: string;
  title: string;
  type: "bar" | "line";
  xLabel: string;
  yLabel: string;
  data: ChartPoint[];
};

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const cleaned = value.replace(/,/g, "").trim();
    const number = Number(cleaned);

    if (cleaned !== "" && Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function aggregateByCategory(
  rows: DatasetRow[],
  categoryColumn: string,
  numericColumn: string
): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const rawCategory = row[categoryColumn];
    const rawValue = toNumber(row[numericColumn]);

    if (rawCategory == null || rawValue == null) {
      continue;
    }

    const category = String(rawCategory).trim();

    if (!category) {
      continue;
    }

    totals.set(
      category,
      (totals.get(category) ?? 0) + rawValue
    );
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({
      label,
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

function isDateLikeColumn(
  rows: DatasetRow[],
  column: string
): boolean {
  const values = rows
    .map((row) => row[column])
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
    .slice(0, 10);

  if (values.length === 0) {
    return false;
  }

  const validDates = values.filter((value) => {
    const date = new Date(String(value));
    return !Number.isNaN(date.getTime());
  });

  return validDates.length >= Math.ceil(values.length * 0.8);
}

function createMonthlyTrend(
  rows: DatasetRow[],
  dateColumn: string,
  numericColumn: string
): ChartPoint[] {
  const totals = new Map<string, number>();

  for (const row of rows) {
    const rawDate = row[dateColumn];
    const rawValue = toNumber(row[numericColumn]);

    if (rawDate == null || rawValue == null) {
      continue;
    }

    const date = new Date(String(rawDate));

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const month = date.toISOString().slice(0, 7);

    totals.set(
      month,
      (totals.get(month) ?? 0) + rawValue
    );
  }

  return Array.from(totals.entries())
    .map(([label, value]) => ({
      label,
      value,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as VisualizationRequest;

    if (!body || !Array.isArray(body.rows)) {
      return NextResponse.json(
        {
          error: "Invalid dataset rows.",
        },
        {
          status: 400,
        }
      );
    }

    const rows = body.rows;

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Dataset is empty.",
        },
        {
          status: 400,
        }
      );
    }

    const firstRow = rows[0];

    if (!firstRow || typeof firstRow !== "object") {
      return NextResponse.json(
        {
          error: "Dataset rows are invalid.",
        },
        {
          status: 400,
        }
      );
    }

    const columns = Object.keys(firstRow);

    const numericColumns = columns.filter((column) => {
  const values = rows
    .map((row) => toNumber(row[column]))
    .filter(
      (value): value is number => value !== null
    );

  return (
    values.length >=
    Math.max(2, Math.ceil(rows.length * 0.6))
  );
});

const dateColumns = columns.filter((column) =>
  isDateLikeColumn(rows, column)
);

const categoryColumns = columns.filter((column) => {
  if (
    numericColumns.includes(column) ||
    dateColumns.includes(column)
  ) {
    return false;
  }

  const uniqueValues = new Set(
    rows
      .map((row) => row[column])
      .filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).trim() !== ""
      )
      .map((value) => String(value).trim())
  );

  return (
    uniqueValues.size >= 2 &&
    uniqueValues.size <= Math.min(20, rows.length)
  );
});

const preferredCategoryColumns = [
  "product",
  "category",
  "item",
  "region",
  "location",
  "city",
  "department",
  "segment",
  "type",
];

const orderedCategoryColumns = [
  ...preferredCategoryColumns
    .map((preferred) =>
      categoryColumns.find(
        (column) =>
          column.toLowerCase().trim() === preferred
      )
    )
    .filter(
      (column): column is string => Boolean(column)
    ),
  ...categoryColumns.filter(
    (column) =>
      !preferredCategoryColumns.includes(
        column.toLowerCase().trim()
      )
  ),
];

const preferredNumericColumns = [
  "sales",
  "revenue",
  "profit",
  "amount",
  "income",
  "cost",
  "quantity",
  "units",
];

const orderedNumericColumns = [
  ...preferredNumericColumns
    .map((preferred) =>
      numericColumns.find(
        (column) =>
          column.toLowerCase().trim() === preferred
      )
    )
    .filter(
      (column): column is string => Boolean(column)
    ),
  ...numericColumns.filter(
    (column) =>
      !preferredNumericColumns.includes(
        column.toLowerCase().trim()
      )
  ),
];

const visualizations: Visualization[] = [];

    if (
      categoryColumns.length > 0 &&
      numericColumns.length > 0
    ) {
      const categoryColumn = orderedCategoryColumns[0];
      const numericColumn = orderedNumericColumns[0];

      const data = aggregateByCategory(
        rows,
        categoryColumn,
        numericColumn
      );

      if (data.length >= 2) {
        visualizations.push({
          id: "category-total",
          title: `${numericColumn} by ${categoryColumn}`,
          type: "bar",
          xLabel: categoryColumn,
          yLabel: numericColumn,
          data,
        });
      }
    }

    if (
      categoryColumns.length > 0 &&
      numericColumns.length > 1
    ) {
      const categoryColumn = orderedCategoryColumns[0];
      const numericColumn = orderedNumericColumns[1];

      const data = aggregateByCategory(
        rows,
        categoryColumn,
        numericColumn
      );

      if (data.length >= 2) {
        visualizations.push({
          id: "category-secondary-total",
          title: `${numericColumn} by ${categoryColumn}`,
          type: "bar",
          xLabel: categoryColumn,
          yLabel: numericColumn,
          data,
        });
      }
    }

    if (
      orderedCategoryColumns.length > 1 &&
      orderedNumericColumns.length > 0
    ) {
      const categoryColumn = orderedCategoryColumns[1];
      const numericColumn = orderedNumericColumns[0];

      const data = aggregateByCategory(
        rows,
        categoryColumn,
        numericColumn
      );

      if (data.length >= 2) {
        visualizations.push({
          id: "secondary-category-total",
          title: `${numericColumn} by ${categoryColumn}`,
          type: "bar",
          xLabel: categoryColumn,
          yLabel: numericColumn,
          data,
        });
      }
    }

    if (
      dateColumns.length > 0 &&
      numericColumns.length > 0
    ) {
      const dateColumn = dateColumns[0];
      const numericColumn = orderedNumericColumns[0];

      const data = createMonthlyTrend(
        rows,
        dateColumn,
        numericColumn
      );

      if (data.length >= 2) {
        visualizations.push({
          id: "monthly-trend",
          title: `${numericColumn} Monthly Trend`,
          type: "line",
          xLabel: "Month",
          yLabel: numericColumn,
          data,
        });
      }
    }

    return NextResponse.json({
      success: true,
      visualizations,
      detectedColumns: {
        numeric: numericColumns,
        category: categoryColumns,
        date: dateColumns,
      },
    });
  } catch (error) {
    console.error(
      "Data Visualization Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Ninu could not generate visualizations.",
      },
      {
        status: 500,
      }
    );
  }
}
