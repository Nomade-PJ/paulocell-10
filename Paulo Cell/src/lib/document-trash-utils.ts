// Utility functions for handling document trash bin functionality

// Key for storing deleted documents in localStorage
const DELETED_DOCUMENTS_KEY = 'pauloCell_deleted_documents';

// Function to move a document to trash
export const moveDocumentToTrash = (documentId: string) => {
  try {
    // Get current documents
    const savedDocuments = localStorage.getItem('pauloCell_documents');
    if (!savedDocuments) return false;
    
    const documents = JSON.parse(savedDocuments);
    const documentToDelete = documents.find((d: any) => d.id === documentId);
    
    if (!documentToDelete) return false;
    
    // Remove from active documents
    const updatedDocuments = documents.filter((d: any) => d.id !== documentId);
    localStorage.setItem('pauloCell_documents', JSON.stringify(updatedDocuments));
    
    // Add to deleted documents
    const savedDeletedDocuments = localStorage.getItem(DELETED_DOCUMENTS_KEY);
    const deletedDocuments = savedDeletedDocuments ? JSON.parse(savedDeletedDocuments) : [];
    
    deletedDocuments.push({
      ...documentToDelete,
      deletedAt: new Date().toISOString()
    });
    
    localStorage.setItem(DELETED_DOCUMENTS_KEY, JSON.stringify(deletedDocuments));
    return true;
  } catch (error) {
    console.error('Error moving document to trash:', error);
    return false;
  }
};

// Function to restore a document from trash
export const restoreDocumentFromTrash = (documentId: string) => {
  try {
    // Get deleted documents
    const savedDeletedDocuments = localStorage.getItem(DELETED_DOCUMENTS_KEY);
    if (!savedDeletedDocuments) return false;
    
    const deletedDocuments = JSON.parse(savedDeletedDocuments);
    const documentToRestore = deletedDocuments.find((d: any) => d.id === documentId);
    
    if (!documentToRestore) return false;
    
    // Remove deletedAt property
    const { deletedAt, ...documentData } = documentToRestore;
    
    // Add back to active documents
    const savedDocuments = localStorage.getItem('pauloCell_documents');
    const documents = savedDocuments ? JSON.parse(savedDocuments) : [];
    documents.push(documentData);
    localStorage.setItem('pauloCell_documents', JSON.stringify(documents));
    
    // Remove from deleted documents
    const updatedDeletedDocuments = deletedDocuments.filter((d: any) => d.id !== documentId);
    localStorage.setItem(DELETED_DOCUMENTS_KEY, JSON.stringify(updatedDeletedDocuments));
    
    return true;
  } catch (error) {
    console.error('Error restoring document from trash:', error);
    return false;
  }
};

// Function to permanently delete a document
export const permanentlyDeleteDocument = (documentId: string) => {
  try {
    const savedDeletedDocuments = localStorage.getItem(DELETED_DOCUMENTS_KEY);
    if (!savedDeletedDocuments) return false;
    
    const deletedDocuments = JSON.parse(savedDeletedDocuments);
    const updatedDeletedDocuments = deletedDocuments.filter((d: any) => d.id !== documentId);
    
    localStorage.setItem(DELETED_DOCUMENTS_KEY, JSON.stringify(updatedDeletedDocuments));
    return true;
  } catch (error) {
    console.error('Error permanently deleting document:', error);
    return false;
  }
};

// Function to get all deleted documents
export const getDeletedDocuments = () => {
  try {
    const savedDeletedDocuments = localStorage.getItem(DELETED_DOCUMENTS_KEY);
    return savedDeletedDocuments ? JSON.parse(savedDeletedDocuments) : [];
  } catch (error) {
    console.error('Error getting deleted documents:', error);
    return [];
  }
};