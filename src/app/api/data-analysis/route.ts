import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type DataRow = Record<string, unknown>;

function isNumericValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function normalizeValue(value: unknown): unknown {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed === "") {
      return null;
    }

    return trimmed;
  }

  return value;
}

function calculateNumericStats(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const sum = values.reduce(
    (total, value) => total + value,
    0
  );

  const mean = sum / values.length;

  const middle = Math.floor(sorted.length / 2);

  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  const min = sorted[0];
  const max = sorted[sorted.length - 1];

  return {
    count: values.length,
    min,
    max,
    mean: Number(mean.toFixed(4)),
    median: Number(median.toFixed(4)),
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Please upload a CSV or Excel file.",
        },
        {
          status: 400,
        }
      );
    }

    const fileName = file.name.toLowerCase();

    const supportedFile =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (!supportedFile) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload CSV, XLSX, or XLS.",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    let rows: DataRow[] = [];

    if (fileName.endsWith(".csv")) {
      const text = buffer.toString("utf-8");

      const parsed = Papa.parse<DataRow>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (parsed.errors.length > 0) {
        return NextResponse.json(
          {
            error:
              "Could not parse the CSV file.",
            details: parsed.errors
              .slice(0, 5)
              .map((item) => item.message),
          },
          {
            status: 400,
          }
        );
      }

      rows = parsed.data;
    } else {
      const workbook = XLSX.read(buffer, {
        type: "buffer",
      });

      const firstSheetName =
        workbook.SheetNames[0];

      if (!firstSheetName) {
        return NextResponse.json(
          {
            error:
              "The Excel file does not contain a worksheet.",
          },
          {
            status: 400,
          }
        );
      }

      const worksheet =
        workbook.Sheets[firstSheetName];

      rows = XLSX.utils.sheet_to_json<DataRow>(
        worksheet,
        {
          defval: null,
        }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error:
            "The uploaded file does not contain any data.",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedRows = rows.map((row) => {
      const normalized: DataRow = {};

      for (const [key, value] of Object.entries(row)) {
        normalized[key] = normalizeValue(value);
      }

      return normalized;
    });

    const columns = Array.from(
      new Set(
        normalizedRows.flatMap((row) =>
          Object.keys(row)
        )
      )
    );

    const columnAnalysis = columns.map((column) => {
      const values = normalizedRows.map(
        (row) => row[column]
      );

      const nonEmptyValues = values.filter(
        (value) =>
          value !== null &&
          value !== undefined &&
          value !== ""
      );

      const missingValues =
        values.length - nonEmptyValues.length;

      const numericValues = nonEmptyValues.filter(
        isNumericValue
      );

      const uniqueValues = new Set(
        nonEmptyValues.map((value) =>
          String(value)
        )
      );

      return {
        name: column,
        dataType:
          numericValues.length ===
          nonEmptyValues.length &&
          nonEmptyValues.length > 0
            ? "number"
            : "text",
        totalValues: values.length,
        nonEmptyValues: nonEmptyValues.length,
        missingValues,
        uniqueValues: uniqueValues.size,
        statistics:
          numericValues.length > 0
            ? calculateNumericStats(numericValues)
            : null,
      };
    });

    const preview = normalizedRows
      .slice(0, 10)
      .map((row) => {
        const previewRow: DataRow = {};

        for (const column of columns) {
          previewRow[column] =
            row[column] ?? null;
        }

        return previewRow;
      });

    const savedAnalysis = await prisma.dataAnalysis.create({
  data: {
    fileName: file.name,
    fileType: file.type || "unknown",
    rowCount: normalizedRows.length,
    columnCount: columns.length,
    columns,
    preview: JSON.parse(JSON.stringify(preview)),
  },
});

return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type || "unknown",
      },
      dataset: {
        rows: normalizedRows.length,
        columns: columns.length,
        columnNames: columns,
        preview,
        columnAnalysis,
      },
    });
  } catch (error: any) {
    console.error(
      "Data Analysis Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ninu AI could not analyze the dataset.",
      },
      {
        status: 500,
      }
    );
  }
}