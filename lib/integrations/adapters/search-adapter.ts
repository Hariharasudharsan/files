export interface ISearchAdapter<T> {
  indexDocument(id: string, document: T): Promise<void>;
  removeDocument(id: string): Promise<void>;
  search(query: string, filters?: Record<string, any>): Promise<T[]>;
}
