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
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Edit Document</h1>
          <p className="text-base-content/70">Document ID: {id}</p>
        </div>
        <DocumentEditor documentId={id} />
      </div>
    </div>
  );
}