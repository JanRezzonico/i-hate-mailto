export type Values = Awaited<ReturnType<typeof settings.getAll>>;

export type Errors = { duration?: string; other?: string };
