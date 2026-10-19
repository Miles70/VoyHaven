// Keep archived test data recoverable while excluding it from normal application reads.
export function softArchive(schema) {
  schema.add({ archivedAt: Date, archiveBatch: { type: String, index: true } });
  schema.pre(/^(find|countDocuments|update|delete)/, function () {
    this.where({ archivedAt: { $exists: false } });
  });
  schema.pre('aggregate', function () {
    this.pipeline().unshift({ $match: { archivedAt: { $exists: false } } });
  });
}
