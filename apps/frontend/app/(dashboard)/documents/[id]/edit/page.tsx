import { Metadata } from 'next';
import DocumentEditor from './components/DocumentEditor';

export const metadata: Metadata = {
  title: 'Edit Document - Marknest',
  description: 'Edit your markdown document with live preview',
};

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 max-w-7xl">
        <div className="mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Edit Document</h1>
          <p className="text-sm sm:text-base text-base-content/70 truncate">ID: {id}</p>
        </div>
        <DocumentEditor documentId={id} />
      </div>
    </div>
  );
}