export default function Table({ columns, data }) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          {columns.map((c, i) => (
            <th key={i} className="border p-2">{c}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {Object.values(row).map((val, j) => (
              <td key={j} className="border p-2">{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}