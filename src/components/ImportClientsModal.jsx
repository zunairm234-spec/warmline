import { useMemo, useRef, useState } from "react";
import {
  Upload,
  X,
  Check,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const DEFAULT_VALUES = {
  name: "",
  company: "",
  email: "",
  phone: "",
  dealValue: 0,
  priority: "Medium",
  stage: "New Lead",
  website: "",
  industry: "",
  whatsapp: "",
  linkedin: "",
  address: "",
  notes: "",
  tags: [],
  leadSource: "",
  lastContactDate: null,
  nextFollowUpDate: null,
  activityLog: [],
  aiInsight: "",
};

/*
|--------------------------------------------------------------------------
| FIELD ALIASES
|--------------------------------------------------------------------------
| Warmline is a generic CRM.
|
| These aliases work for:
| - Freelancers
| - Agencies
| - Small businesses
| - Sales prospects
| - Consultants
| - Service providers
| - Companies
| - Individual clients
|
| Unknown spreadsheet columns are safely ignored.
|--------------------------------------------------------------------------
*/

const FIELD_ALIASES = {
  name: [
    "name",
    "full name",
    "client name",
    "customer name",
    "contact name",
    "person name",
    "contact person",
    "primary contact",
    "contact",
  ],

  company: [
    "company",
    "company name",
    "business",
    "business name",
    "organization",
    "organisation",
    "organization name",
    "organisation name",
    "practice name",
    "firm name",
    "agency name",
    "brand name",
  ],

  email: [
    "email",
    "email address",
    "e-mail",
    "e-mail address",
    "contact email",
    "business email",
    "work email",
  ],

  phone: [
    "phone",
    "phone number",
    "mobile",
    "mobile number",
    "telephone",
    "telephone number",
    "contact number",
    "main line",
    "phone main line",
    "phone (main line)",
    "business phone",
    "work phone",
  ],

  dealValue: [
    "deal value",
    "deal",
    "deal amount",
    "value",
    "amount",
    "revenue",
    "potential value",
    "potential revenue",
    "estimated value",
  ],

  priority: [
    "priority",
    "importance",
  ],

  stage: [
    "stage",
    "status",
    "pipeline stage",
    "lead status",
    "client status",
  ],

  website: [
    "website",
    "website url",
    "website address",
    "web",
    "url",
    "web url",
  ],

  industry: [
    "industry",
    "business type",
    "sector",
    "category",
    "specialty",
    "speciality",
    "specility",
    "service type",
    "profession",
    "niche",
  ],

  whatsapp: [
    "whatsapp",
    "whatsapp number",
    "whatsapp phone",
    "whatsapp phone number",
  ],

  linkedin: [
    "linkedin",
    "linkedin url",
    "linkedin profile",
    "linkedin profile url",
  ],

  address: [
    "address",
    "full address",
    "street address",
    "business address",
    "company address",
    "location",
  ],

  notes: [
    "notes",
    "note",
    "comments",
    "comment",
    "description",
    "additional notes",
  ],

  tags: [
    "tags",
    "tag",
    "labels",
    "label",
  ],

  leadSource: [
    "lead source",
    "source",
    "lead origin",
    "acquisition source",
    "channel",
  ],

  lastContactDate: [
    "last contact",
    "last contact date",
    "last contacted",
    "last contacted date",
  ],

  nextFollowUpDate: [
    "next follow up",
    "next follow-up",
    "next follow up date",
    "next follow-up date",
    "follow up date",
    "follow-up date",
    "next contact date",
  ],
};

/*
|--------------------------------------------------------------------------
| NORMALIZE HEADER
|--------------------------------------------------------------------------
*/

function normalizeHeader(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replace(/[()[\]{}]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

/*
|--------------------------------------------------------------------------
| CLEAN VALUE
|--------------------------------------------------------------------------
*/

function cleanValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

/*
|--------------------------------------------------------------------------
| FIND COLUMN
|--------------------------------------------------------------------------
|
| IMPORTANT:
| Only exact normalized matches are accepted.
|
| This prevents:
| Phone accidentally becoming Name
| Address accidentally becoming Email
| Website accidentally becoming Company
|--------------------------------------------------------------------------
*/

function findColumn(columns, aliases) {
  const normalizedAliases =
    aliases.map(normalizeHeader);

  return (
    columns.find((column) =>
      normalizedAliases.includes(
        normalizeHeader(column)
      )
    ) || ""
  );
}

/*
|--------------------------------------------------------------------------
| BUILD FIELD MAPPING
|--------------------------------------------------------------------------
*/

function buildMapping(columns) {
  const mapping = {};

  Object.entries(
    FIELD_ALIASES
  ).forEach(
    ([fieldKey, aliases]) => {
      mapping[fieldKey] =
        findColumn(
          columns,
          aliases
        );
    }
  );

  return mapping;
}

/*
|--------------------------------------------------------------------------
| PARSE DATE
|--------------------------------------------------------------------------
*/

function parseDate(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return null;
    }

    return value
      .toISOString()
      .slice(0, 10);
  }

  if (
    typeof value === "number"
  ) {
    const parsed =
      XLSX.SSF.parse_date_code(
        value
      );

    if (parsed) {
      const year = String(
        parsed.y
      ).padStart(4, "0");

      const month = String(
        parsed.m
      ).padStart(2, "0");

      const day = String(
        parsed.d
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
  }

  const parsedDate =
    new Date(value);

  if (
    !Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return parsedDate
      .toISOString()
      .slice(0, 10);
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| PARSE TAGS
|--------------------------------------------------------------------------
*/

function parseTags(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value;
  }

  return String(value)
    .split(/[,;|]/)
    .map(
      (item) =>
        item.trim()
    )
    .filter(Boolean);
}

/*
|--------------------------------------------------------------------------
| PARSE DEAL VALUE
|--------------------------------------------------------------------------
*/

function parseDealValue(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const cleaned =
    String(value)
      .replace(
        /[$£€,\s]/g,
        ""
      )
      .replace(
        /[^\d.-]/g,
        ""
      );

  const number =
    Number(cleaned);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

/*
|--------------------------------------------------------------------------
| GET VALUE
|--------------------------------------------------------------------------
*/

function getValue(row, column) {
  if (!column) {
    return "";
  }

  return cleanValue(
    row[column]
  );
}

/*
|--------------------------------------------------------------------------
| CREATE ACTIVITY LOG
|--------------------------------------------------------------------------
*/

function createActivityLog(
  row,
  mapping
) {
  const activityLog = [];

  const lastContactDate =
    parseDate(
      row[
        mapping.lastContactDate
      ]
    );

  if (lastContactDate) {
    activityLog.push({
      id: `import-${Date.now()}-last-contact`,
      date: lastContactDate,
      type: "Contact",
      note:
        "Imported from spreadsheet",
    });
  }

  return activityLog;
}

/*
|--------------------------------------------------------------------------
| IMPORT CLIENTS MODAL
|--------------------------------------------------------------------------
*/

export default function ImportClientsModal({
  onClose,
  onImport,
  existingClients = [],
}) {
  const fileInputRef =
    useRef(null);

  const [
    step,
    setStep,
  ] = useState("upload");

  const [
    fileName,
    setFileName,
  ] = useState("");

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    columns,
    setColumns,
  ] = useState([]);

  const [
    mapping,
    setMapping,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    isImporting,
    setIsImporting,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | RESET FILE INPUT
  |--------------------------------------------------------------------------
  */

  function resetFileInput() {
    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | HANDLE FILE
  |--------------------------------------------------------------------------
  */

  function handleFile(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setFileName(
      file.name
    );

    const reader =
      new FileReader();

    reader.onload = (e) => {
      try {
        const buffer =
          e.target?.result;

        if (!buffer) {
          throw new Error(
            "Could not read the file."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | READ WORKBOOK
        |--------------------------------------------------------------------------
        */

        const workbook =
          XLSX.read(buffer, {
            type: "array",
            cellDates: true,
          });

        if (
          !workbook.SheetNames
            .length
        ) {
          throw new Error(
            "The workbook does not contain any sheets."
          );
        }

        const firstSheet =
          workbook.Sheets[
            workbook.SheetNames[0]
          ];

        if (!firstSheet) {
          throw new Error(
            "Could not find the first worksheet."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | GET RAW SHEET
        |--------------------------------------------------------------------------
        |
        | We first read the worksheet as an array.
        | This allows us to find the real header row.
        |--------------------------------------------------------------------------
        */

        const rawSheet =
          XLSX.utils.sheet_to_json(
            firstSheet,
            {
              header: 1,
              defval: "",
              raw: false,
            }
          );

        if (
          !rawSheet.length
        ) {
          throw new Error(
            "The spreadsheet is empty."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | FIND HEADER ROW
        |--------------------------------------------------------------------------
        */

        const headerIndex =
          rawSheet.findIndex(
            (row) =>
              Array.isArray(
                row
              ) &&
              row.some(
                (cell) =>
                  cleanValue(
                    cell
                  ) !== ""
              )
          );

        if (
          headerIndex === -1
        ) {
          throw new Error(
            "Could not find spreadsheet headers."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | GET HEADERS
        |--------------------------------------------------------------------------
        */

        const rawHeaders =
          rawSheet[
            headerIndex
          ];

        const detectedColumns =
          rawHeaders.map(
            (
              header,
              index
            ) => {
              const value =
                cleanValue(
                  header
                );

              return (
                value ||
                `Column ${index + 1}`
              );
            }
          );

        /*
        |--------------------------------------------------------------------------
        | GET DATA ROWS
        |--------------------------------------------------------------------------
        */

        const dataRows =
          rawSheet
            .slice(
              headerIndex + 1
            )
            .filter(
              (row) =>
                Array.isArray(
                  row
                ) &&
                row.some(
                  (cell) =>
                    cleanValue(
                      cell
                    ) !== ""
                )
            );

        if (
          !dataRows.length
        ) {
          throw new Error(
            "The spreadsheet has headers but no records."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | IMPORTANT FIX
        |--------------------------------------------------------------------------
        |
        | Create each row using the exact header INDEX.
        |
        | Example:
        |
        | Company  -> row[0]
        | Specialty -> row[1]
        | Address -> row[2]
        | Timings -> row[3]
        | Phone -> row[4]
        | Website -> row[5]
        |
        | This prevents Phone from accidentally becoming Name.
        |--------------------------------------------------------------------------
        */

        const jsonRows =
          dataRows.map(
            (row) => {
              const record = {};

              detectedColumns.forEach(
                (
                  column,
                  index
                ) => {
                  record[column] =
                    row[index] ?? "";
                }
              );

              return record;
            }
          );

        /*
        |--------------------------------------------------------------------------
        | BUILD MAPPING
        |--------------------------------------------------------------------------
        */

        const detectedMapping =
          buildMapping(
            detectedColumns
          );

        /*
        |--------------------------------------------------------------------------
        | REQUIRE NAME OR COMPANY
        |--------------------------------------------------------------------------
        |
        | A CRM record can be:
        |
        | John Smith
        |
        | OR
        |
        | ElevIQ
        |
        | We do not require both.
        |--------------------------------------------------------------------------
        */

        if (
          !detectedMapping.name &&
          !detectedMapping.company
        ) {
          throw new Error(
            "Warmline could not find a Name or Company column. Please make sure your spreadsheet has a column such as Name, Full Name, Contact Name, Company, Business Name, or Organization."
          );
        }

        /*
        |--------------------------------------------------------------------------
        | SAVE IMPORT DATA
        |--------------------------------------------------------------------------
        */

        setColumns(
          detectedColumns
        );

        setRows(
          jsonRows
        );

        setMapping(
          detectedMapping
        );

        setStep(
          "preview"
        );
      } catch (err) {
        console.error(
          "Failed to read spreadsheet:",
          err
        );

        setError(
          err.message ||
            "Could not read the spreadsheet."
        );

        resetFileInput();
      }
    };

    reader.onerror = () => {
      setError(
        "The file could not be read."
      );

      resetFileInput();
    };

    reader.readAsArrayBuffer(
      file
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PREPARE CLIENTS
  |--------------------------------------------------------------------------
  */

  const preparedClients =
    useMemo(() => {
      if (!mapping) {
        return [];
      }

      return rows.map(
        (row) => {
          /*
          |--------------------------------------------------------------------------
          | IMPORTANT
          |--------------------------------------------------------------------------
          |
          | Name ONLY comes from a Name/Contact column.
          |
          | Company ONLY comes from a Company column.
          |
          | We NEVER do:
          |
          | name = company
          |
          | This prevents business names or phone numbers
          | from appearing in the Name field.
          |--------------------------------------------------------------------------
          */

          const name =
            getValue(
              row,
              mapping.name
            );

          const company =
            getValue(
              row,
              mapping.company
            );

          const address =
            getValue(
              row,
              mapping.address
            );

          /*
          |--------------------------------------------------------------------------
          | CITY
          |--------------------------------------------------------------------------
          */

          const cityColumn =
            findColumn(
              columns,
              ["city"]
            );

          const city =
            getValue(
              row,
              cityColumn
            );

          const fullAddress =
            [
              address,
              city,
            ]
              .filter(Boolean)
              .join(", ");

          /*
          |--------------------------------------------------------------------------
          | RETURN CRM RECORD
          |--------------------------------------------------------------------------
          */

          return {
            ...DEFAULT_VALUES,

            name,

            company,

            email:
              getValue(
                row,
                mapping.email
              ),

            phone:
              getValue(
                row,
                mapping.phone
              ),

            dealValue:
              parseDealValue(
                row[
                  mapping.dealValue
                ]
              ),

            priority:
              getValue(
                row,
                mapping.priority
              ) ||
              "Medium",

            stage:
              getValue(
                row,
                mapping.stage
              ) ||
              "New Lead",

            website:
              getValue(
                row,
                mapping.website
              ),

            industry:
              getValue(
                row,
                mapping.industry
              ),

            whatsapp:
              getValue(
                row,
                mapping.whatsapp
              ),

            linkedin:
              getValue(
                row,
                mapping.linkedin
              ),

            address:
              fullAddress,

            notes:
              getValue(
                row,
                mapping.notes
              ),

            tags:
              parseTags(
                row[
                  mapping.tags
                ]
              ),

            leadSource:
              getValue(
                row,
                mapping.leadSource
              ),

            lastContactDate:
              parseDate(
                row[
                  mapping.lastContactDate
                ]
              ),

            nextFollowUpDate:
              parseDate(
                row[
                  mapping.nextFollowUpDate
                ]
              ),

            activityLog:
              createActivityLog(
                row,
                mapping
              ),

            aiInsight: "",
          };
        }
      );
    }, [
      rows,
      mapping,
      columns,
    ]);

  /*
  |--------------------------------------------------------------------------
  | VALID CLIENTS
  |--------------------------------------------------------------------------
  |
  | Either Name OR Company is enough.
  |--------------------------------------------------------------------------
  */

  const validClients =
    preparedClients.filter(
      (client) =>
        client.name.trim() !==
          "" ||
        client.company.trim() !==
          ""
    );

  const invalidCount =
    preparedClients.length -
    validClients.length;

  /*
  |--------------------------------------------------------------------------
  | DUPLICATE DETECTION
  |--------------------------------------------------------------------------
  */

  const duplicateIndexes =
    useMemo(() => {
      const duplicates =
        new Set();

      const existingEmails =
        new Set(
          existingClients
            .map(
              (client) =>
                cleanValue(
                  client.email
                ).toLowerCase()
            )
            .filter(Boolean)
        );

      const existingPhones =
        new Set(
          existingClients
            .map(
              (client) =>
                cleanValue(
                  client.phone
                ).replace(
                  /\D/g,
                  ""
                )
            )
            .filter(Boolean)
        );

      const seenEmails =
        new Set();

      const seenPhones =
        new Set();

      preparedClients.forEach(
        (
          client,
          index
        ) => {
          const email =
            cleanValue(
              client.email
            ).toLowerCase();

          const phone =
            cleanValue(
              client.phone
            ).replace(
              /\D/g,
              ""
            );

          if (
            email &&
            (
              existingEmails.has(
                email
              ) ||
              seenEmails.has(
                email
              )
            )
          ) {
            duplicates.add(
              index
            );
          }

          if (
            phone &&
            (
              existingPhones.has(
                phone
              ) ||
              seenPhones.has(
                phone
              )
            )
          ) {
            duplicates.add(
              index
            );
          }

          if (email) {
            seenEmails.add(
              email
            );
          }

          if (phone) {
            seenPhones.add(
              phone
            );
          }
        }
      );

      return duplicates;
    }, [
      preparedClients,
      existingClients,
    ]);

  /*
  |--------------------------------------------------------------------------
  | HANDLE IMPORT
  |--------------------------------------------------------------------------
  */

  async function handleImport() {
    if (
      validClients.length ===
      0
    ) {
      setError(
        "No valid records were found. Each record needs at least a Name or Company."
      );

      return;
    }

    setError("");
    setIsImporting(true);

    try {
      const clientsToImport =
        preparedClients.filter(
          (
            client,
            index
          ) =>
            (
              client.name ||
              client.company
            ) &&
            !duplicateIndexes.has(
              index
            )
        );

      if (
        clientsToImport.length ===
        0
      ) {
        setError(
          "All valid records are duplicates. Nothing new can be imported."
        );

        return;
      }

      await onImport(
        clientsToImport
      );

      setStep(
        "success"
      );
    } catch (err) {
      console.error(
        "Import failed:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while importing your clients."
      );
    } finally {
      setIsImporting(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
    >
      <div
        className="modal import-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="modal-head">
          <div>
            <h2>
              Import clients
            </h2>

            <p className="view-sub">
              Import your spreadsheet directly into Warmline.
            </p>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {step ===
          "upload" && (
          <div className="import-upload">
            <div className="import-icon">
              <FileSpreadsheet
                size={36}
              />
            </div>

            <h3>
              Upload your Excel or CSV file
            </h3>

            <p>
              Warmline automatically recognizes common CRM fields from your spreadsheet.
            </p>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept=".xlsx,.xls,.csv"
              hidden
              onChange={
                handleFile
              }
            />

            <button
              className="btn btn-primary"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Upload size={16} />
              Choose file
            </button>

            {error && (
              <div className="import-error">
                <AlertTriangle
                  size={16}
                />

                {error}
              </div>
            )}
          </div>
        )}

        {step ===
          "preview" && (
          <>
            <div className="import-file-info">
              <FileSpreadsheet
                size={18}
              />

              <span>
                {fileName}
              </span>

              <span className="view-sub">
                {rows.length} rows found
              </span>
            </div>

            <div className="import-summary">
              <div>
                <strong>
                  {
                    validClients.length
                  }
                </strong>

                <span>
                  Ready to import
                </span>
              </div>

              <div>
                <strong>
                  {
                    invalidCount
                  }
                </strong>

                <span>
                  Missing Name & Company
                </span>
              </div>

              <div>
                <strong>
                  {
                    duplicateIndexes.size
                  }
                </strong>

                <span>
                  Possible duplicates
                </span>
              </div>
            </div>

            <div className="import-preview">
              <table>
                <thead>
                  <tr>
                    <th>
                      Name
                    </th>

                    <th>
                      Company
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Phone
                    </th>

                    <th>
                      Address
                    </th>

                    <th>
                      Industry
                    </th>

                    <th>
                      Stage
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {preparedClients
                    .slice(
                      0,
                      10
                    )
                    .map(
                      (
                        client,
                        index
                      ) => (
                        <tr
                          key={
                            index
                          }
                        >
                          <td>
                            {
                              client.name ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.company ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.email ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.phone ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.address ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.industry ||
                              "—"
                            }
                          </td>

                          <td>
                            {
                              client.stage ||
                              "New Lead"
                            }
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>

            <div className="import-detected-fields">
              <strong>
                Automatically detected:
              </strong>

              <span>
                {
                  columns.length
                }{" "}
                spreadsheet columns
              </span>
            </div>

            {duplicateIndexes.size >
              0 && (
              <div className="import-warning">
                <AlertTriangle
                  size={16}
                />

                <span>
                  Possible duplicate records will be skipped automatically.
                </span>
              </div>
            )}

            {error && (
              <div className="import-error">
                <AlertTriangle
                  size={16}
                />

                {error}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setStep(
                    "upload"
                  );

                  setRows([]);
                  setColumns([]);
                  setMapping(null);
                  setError("");

                  resetFileInput();
                }}
                disabled={
                  isImporting
                }
              >
                Back
              </button>

              <button
                className="btn btn-primary"
                onClick={
                  handleImport
                }
                disabled={
                  isImporting ||
                  validClients.length ===
                    0
                }
              >
                {isImporting ? (
                  "Importing..."
                ) : (
                  <>
                    <Check
                      size={16}
                    />

                    Import clients
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step ===
          "success" && (
          <div className="import-success">
            <div className="success-icon">
              <Check size={32} />
            </div>

            <h3>
              Clients imported
            </h3>

            <p>
              Your spreadsheet records have been successfully added to Warmline.
            </p>

            <button
              className="btn btn-primary"
              onClick={
                onClose
              }
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}