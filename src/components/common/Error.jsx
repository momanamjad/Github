const Error = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-github-muted">
      <h2 className="text-lg font-semibold mb-2">404</h2>
      <p>{message}</p>
    </div>
  );
};

export default Error;
