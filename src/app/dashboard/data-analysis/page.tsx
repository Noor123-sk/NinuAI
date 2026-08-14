"use client";

import { useState } from "react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type ColumnAnalysis = {
  name: string;
  dataType: string;
  totalValues: number;
  nonEmptyValues: number;
  missingValues: number;
  uniqueValues: number;
  statistics: {
    count: number;
    min: number;
    max: number;
    mean: number;
    median: number;
  } | null;
};

type DatasetResponse = {
  success: boolean;
  file: {
    name: string;
    size: number;
    type: string;
  };
  dataset: {
    rows: number;
    columns: number;
    columnNames: string[];
    preview: Record<string, unknown>[];
    columnAnalysis: ColumnAnalysis[];
    aggregateStats: {
      numericColumnTotals: Record<string, number>;
      numericColumnCounts: Record<string, number>;
    };
  };
};

export default function DataAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] =
    useState<DatasetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState("");
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);

const [visualizations, setVisualizations] = useState<
  {
    id: string;
    title: string;
    type: "bar" | "line";
    xLabel: string;
    yLabel: string;
    data: {
      label: string;
      value: number;
    }[];
  }[]
>([]);
const [visualizationLoading, setVisualizationLoading] =
  useState(false);


  const generateVisualizations = async () => {
  if (!result) {
    setError("Please analyze a dataset first.");
    return;
  }

  setVisualizationLoading(true);
  setError("");
  setVisualizations([]);

  try {
    const response = await fetch(
      "/api/data-analysis/visualizations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rows: result.dataset.preview,
          columnAnalysis:
            result.dataset.columnAnalysis,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.error ||
          "Failed to generate visualizations."
      );
    }

    setVisualizations(
      Array.isArray(data.visualizations)
        ? data.visualizations
        : []
    );
  } catch (err: any) {
    setError(
      err?.message ||
        "Ninu could not generate visualizations."
    );
  } finally {
    setVisualizationLoading(false);
  }
};

const numericColumns = result?.dataset.columnAnalysis.filter(
  (column) => column.dataType === "number"
) ?? [];

const salesColumn =
  numericColumns.find(
    (column) => column.name.toLowerCase().trim() === "sales"
  ) ?? numericColumns.find(
    (column) => column.name.toLowerCase().includes("sales")
  );

const profitColumn =
  numericColumns.find(
    (column) => column.name.toLowerCase().trim() === "profit"
  ) ?? numericColumns.find(
    (column) => column.name.toLowerCase().includes("profit")
  );

const totalSales = salesColumn?.statistics
  ? salesColumn.statistics.mean * salesColumn.statistics.count
  : 0;

const totalProfit = profitColumn?.statistics
  ? profitColumn.statistics.mean * profitColumn.statistics.count
  : 0;

const averageSales = salesColumn?.statistics?.mean ?? 0;

const profitMargin =
  totalSales > 0
    ? (totalProfit / totalSales) * 100
    : 0;

const getTopCategory = (
  columnName?: string
): string => {
  if (!result || !columnName || !salesColumn) {
    return "—";
  }

  const totals = new Map<string, number>();

  for (const row of result.dataset.preview) {
    const category = String(
      row[columnName] ?? ""
    ).trim();

    if (!category) {
      continue;
    }

    const salesValue = Number(
      String(row[salesColumn.name] ?? "")
        .replace(/,/g, "")
    );

    if (!Number.isFinite(salesValue)) {
      continue;
    }

    totals.set(
      category,
      (totals.get(category) ?? 0) + salesValue
    );
  }

  const top = Array.from(totals.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return top?.[0] ?? "—";
};

const productColumn =
  result?.dataset.columnAnalysis.find(
    (column) =>
      column.name.toLowerCase().trim() === "product"
  );

const regionColumn =
  result?.dataset.columnAnalysis.find(
    (column) =>
      column.name.toLowerCase().trim() === "region"
  );

const topProduct = getTopCategory(productColumn?.name);
const topRegion = getTopCategory(regionColumn?.name);

const askNinu = async () => {
    if (!result) {
      setError("Please analyze a dataset first.");
      return;
    }

    if (!askQuestion.trim()) {
      setError("Please enter a question.");
      return;
    }

    setAskLoading(true);
    setAskAnswer("");
    setError("");

    try {
      const response = await fetch(
        "/api/data-analysis/ask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: askQuestion.trim(),
            rows: result.dataset.preview,
            columnAnalysis:
              result.dataset.columnAnalysis.map(
                (column) => ({
                  name: column.name,
                  dataType: column.dataType,
                })
              ),
            aggregateStats:
              result.dataset.aggregateStats,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to get an answer from Ninu."
        );
      }

      setAskAnswer(data.answer || "");
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while asking Ninu."
      );
    } finally {
      setAskLoading(false);
    }
  };

const generateInsights = async () => {
    if (!result) {
      setError("Please analyze a dataset first.");
      return;
    }

    setInsightLoading(true);
    setError("");
    setInsight("");

    try {
      const response = await fetch(
        "/api/data-analysis/insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: result.file.name,
            rows: result.dataset.rows,
            columns: result.dataset.columns,
            columnNames: result.dataset.columnNames,
            columnAnalysis:
              result.dataset.columnAnalysis,
            preview: result.dataset.preview,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to generate AI insights."
        );
      }

      setInsight(data.insight || "");
    } catch (err: any) {
      setError(
        err?.message ||
          "Ninu could not generate insights."
      );
    } finally {
      setInsightLoading(false);
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();

    const supported =
      fileName.endsWith(".csv") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls");

    if (!supported) {
      setError(
        "Please upload a CSV, XLSX, or XLS file."
      );
      setFile(null);
      setResult(null);
      return;
    }

    setError("");
    setResult(null);
    setFile(selectedFile);
  };

  const analyzeFile = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        "/api/data-analysis",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to analyze the dataset."
        );
      }

      setResult(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong while analyzing the file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          📊 Ninu Data Analysis
        </h1>

        <p className="mt-2 text-gray-500">
          Upload CSV or Excel files and let Ninu
          analyze your data.
        </p>
      </div>

      {/* Upload Card */}
      <div className="mt-10 rounded-3xl border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold">
          Upload your dataset
        </h2>

        <p className="mt-2 text-gray-500">
          Supported formats: CSV, XLSX, XLS
        </p>

        <label className="mt-6 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100">
          {file ? (
            <>
              <div className="text-5xl">📄</div>

              <p className="mt-4 font-semibold">
                {file.name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl">📤</div>

              <p className="mt-4 font-semibold">
                Click to upload your dataset
              </p>

              <p className="mt-1 text-sm text-gray-500">
                CSV, XLSX, or XLS
              </p>
            </>
          )}

          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={analyzeFile}
          disabled={loading || !file}
          className="mt-6 rounded-full bg-black px-8 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "🧠 Ninu is analyzing..."
            : "📊 Analyze Dataset"}
        </button>
      </div>

      {/* Dataset Overview */}
      {result && (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Rows
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.dataset.rows.toLocaleString()}
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                Columns
              </p>

              <p className="mt-2 text-3xl font-bold">
                {result.dataset.columns}
              </p>
            </div>

            <div className="rounded-3xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">
                File
              </p>

              <p className="mt-2 truncate text-lg font-bold">
                {result.file.name}
              </p>
            </div>
          </div>

          {/* AI Insights */}
          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  🧠 Ninu&apos;s AI Insights
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Let Ninu turn your dataset into useful business insights.
                </p>
              </div>

              <button
                onClick={generateInsights}
                disabled={insightLoading}
                className="rounded-full bg-black px-6 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {insightLoading
                  ? "🧠 Ninu is thinking..."
                  : "✨ Generate AI Insights"}
              </button>

              <button
                onClick={generateVisualizations}
                disabled={visualizationLoading}
                className="ml-3 rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {visualizationLoading
                  ? "📊 Generating Charts..."
                  : "📈 Generate Visualizations"}
              </button>
            </div>

            {insight && (
              <div className="mt-6 rounded-2xl border bg-gray-50 p-6">
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {insight}
                </div>
              </div>
            )}
          </div>

          {/* Business KPI Dashboard */}
          <div className="mt-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold">
                📊 Business KPI Dashboard
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Key performance indicators calculated from your dataset.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  💰 Total Sales
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {totalSales.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  📈 Total Profit
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {totalProfit.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  📊 Average Sales
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {averageSales.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  💹 Profit Margin
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {profitMargin.toFixed(2)}%
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  🏆 Top Product
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {topProduct}
                </p>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  📍 Top Region
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {topRegion}
                </p>
              </div>
            </div>
          </div>

          {/* Ask Ninu */}
          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  🧠 Ask Ninu About Your Data
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ask questions about your uploaded dataset and get
                  AI-powered answers.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={askQuestion}
                onChange={(event) =>
                  setAskQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !askLoading) {
                    askNinu();
                  }
                }}
                placeholder="Ask something about your data..."
                className="flex-1 rounded-2xl border border-gray-300 px-5 py-4 text-sm outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
              />

              <button
                onClick={askNinu}
                disabled={askLoading}
                className="rounded-2xl bg-black px-7 py-4 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {askLoading
                  ? "🤖 Ninu is thinking..."
                  : "🤖 Ask Ninu"}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {[
                "Which product performs best?",
                "What is the total profit?",
                "Which region has the highest sales?",
                "Give me business recommendations.",
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setAskQuestion(question);
                  }}
                  className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100"
                >
                  {question}
                </button>
              ))}
            </div>

            {askAnswer && (
              <div className="mt-6 rounded-2xl border bg-gray-50 p-6">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <h3 className="font-semibold text-gray-900">
                    Ninu's Answer
                  </h3>
                </div>

                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                  {askAnswer}
                </div>
              </div>
            )}
          </div>

          {/* Column Analysis */}
          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">
              🔍 Column Analysis
            </h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3">
                      Column
                    </th>

                    <th className="px-4 py-3">
                      Type
                    </th>

                    <th className="px-4 py-3">
                      Missing
                    </th>

                    <th className="px-4 py-3">
                      Unique
                    </th>

                    <th className="px-4 py-3">
                      Mean
                    </th>

                    <th className="px-4 py-3">
                      Median
                    </th>

                    <th className="px-4 py-3">
                      Min
                    </th>

                    <th className="px-4 py-3">
                      Max
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {result.dataset.columnAnalysis.map(
                    (column) => (
                      <tr
                        key={column.name}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {column.name}
                        </td>

                        <td className="px-4 py-3">
                          {column.dataType}
                        </td>

                        <td className="px-4 py-3">
                          {column.missingValues}
                        </td>

                        <td className="px-4 py-3">
                          {column.uniqueValues}
                        </td>

                        <td className="px-4 py-3">
                          {column.statistics
                            ? column.statistics.mean
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          {column.statistics
                            ? column.statistics.median
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          {column.statistics
                            ? column.statistics.min
                            : "—"}
                        </td>

                        <td className="px-4 py-3">
                          {column.statistics
                            ? column.statistics.max
                            : "—"}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Visualizations */}
          {visualizations.length > 0 && (
            <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
              <div className="mb-8">
                <h2 className="text-xl font-bold">
                  📊 Data Visualizations
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Visual summaries generated from your dataset.
                </p>
              </div>

              <div className="grid gap-8">
                {visualizations.map((chart) => (
                  <div
                    key={chart.id}
                    className="rounded-2xl border bg-gray-50 p-5"
                  >
                    <h3 className="mb-5 text-lg font-semibold">
                      {chart.title}
                    </h3>

                    <div className="h-80 w-full">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        {chart.type === "line" ? (
                          <LineChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        ) : (
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="label"
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis
                              tick={{ fontSize: 12 }}
                            />
                            <Tooltip />
                            <Bar
                              dataKey="value"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview */}
          <div className="mt-8 rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">
              👀 Data Preview
            </h2>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b">
                    {result.dataset.columnNames.map(
                      (column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap px-4 py-3"
                        >
                          {column}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {result.dataset.preview.map(
                    (row, index) => (
                      <tr
                        key={index}
                        className="border-b last:border-b-0"
                      >
                        {result.dataset.columnNames.map(
                          (column) => (
                            <td
                              key={column}
                              className="whitespace-nowrap px-4 py-3"
                            >
                              {String(
                                row[column] ?? "—"
                              )}
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}