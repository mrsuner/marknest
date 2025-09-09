export function FilesLoading() {
  return (
    <div className="text-center py-12">
      <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
      <h3 className="text-lg font-medium text-base-content mb-1">Loading files...</h3>
      <p className="text-base-content/60">Please wait while we fetch your files</p>
    </div>
  );
}