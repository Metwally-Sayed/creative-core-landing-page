type PayloadDatabaseUnavailableProps = {
  databaseURL: string;
};

export default function PayloadDatabaseUnavailable({
  databaseURL,
}: PayloadDatabaseUnavailableProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f4ed",
        color: "#18181b",
        padding: "4rem 1.5rem",
      }}
    >
      <div
        style={{
          maxWidth: "48rem",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          borderRadius: "2rem",
          border: "1px solid rgba(24,24,27,0.1)",
          background: "#ffffff",
          padding: "2rem",
          boxShadow: "0 24px 80px rgba(24,24,27,0.08)",
        }}
      >
        <div style={{ display: "grid", gap: "0.5rem" }}>
          <p
            style={{
              margin: 0,
              color: "#71717a",
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            Payload Setup
          </p>
          <h1
            style={{
              margin: 0,
              fontSize: "2.25rem",
              lineHeight: 1,
              fontFamily: "Georgia, serif",
            }}
          >
            PostgreSQL is not running
          </h1>
        </div>
        <p
          style={{
            maxWidth: "42rem",
            margin: 0,
            color: "#52525b",
            fontSize: "0.875rem",
            lineHeight: 1.7,
          }}
        >
          Payload is installed correctly, but the admin cannot start until it can
          reach your PostgreSQL server.
        </p>
        <div
          style={{
            borderRadius: "1rem",
            background: "#09090b",
            color: "#f4f4f5",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.75rem",
            padding: "0.75rem 1rem",
          }}
        >
          DATABASE_URL={databaseURL}
        </div>
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            color: "#3f3f46",
            fontSize: "0.875rem",
            lineHeight: 1.7,
          }}
        >
          <p style={{ margin: 0 }}>
            Start PostgreSQL and create the database named <code>hello_monday_payload</code>.
          </p>
          <p>
            Then reload <code>/admin</code>. Payload will connect and auto-push the schema.
          </p>
        </div>
      </div>
    </div>
  );
}
