export const API_BASE = (import.meta.env.VITE_API_BASE ?? '/api/v1').replace(/\/$/, '')

// SKG-IF types
export type LanguageMap<T> = Record<string, T>

export interface GraphResponse<T> {
    '@graph': T[]
    meta?: { part_of?: { total_items?: number } }
}

export interface Identifier {
    value: string;
    scheme: string | null;
}

export interface Entity {
    local_identifier: string;
    entity_type: string;
    identifiers?: Identifier[];
    [key: string]: unknown;
}

export interface Topic extends Entity {
    labels: LanguageMap<string>;
}

export interface AccessRights {
    status: string;
    description: string;
}

export interface HostingDataSource {
    local_identifier: string;
    entity_type: string;
    name?: string;
}

export interface Biblio {
    hosting_data_source?: HostingDataSource;
}

export interface Manifestation {
    access_rights?: AccessRights;
    license?: string;
    biblio?: Biblio;
}

export interface Product extends Entity {
    product_type: string;
    titles?: LanguageMap<string>;
    abstracts?: LanguageMap<string>;
    topics?: { term: Topic[]; }[]
    manifestations?: Manifestation[];
}

export interface Person extends Entity {
    name?: string
    given_name?: string
    family_name?: string
}

// App types
export interface ListResult<T> {
    items: T[];
    totalItems?: number;
}

export interface ListParams {
    page: number;
    pageSize: number;
    filters: [string, string][];
}

class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

async function getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            Accept: 'application/ld+json, application/json'
        }
    });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        const unsupported = body?.unsupported_filters ? ` (${body.unsupported_filters.join(', ')})` : '';
        throw new ApiError(res.status, `${body?.detail ?? body?.message ?? res.statusText}${unsupported}`);
    }
    return res.json();
}

export async function fetchList<T extends Entity>(path: string, { page, pageSize, filters }: ListParams): Promise<ListResult<T>> {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (filters.length) {
        params.set('filter', filters.map(([k, v]) => `${k}:${v}`).join(','));
    }
    const data = await getJson<GraphResponse<T>>(`${API_BASE}/${path}?${params}`);
    return {
        items: data['@graph'] ?? [],
        totalItems: data.meta?.part_of?.total_items
    }
}

export async function fetchOne<T extends Entity>(path: string, id: string): Promise<T> {
    const data = await getJson<GraphResponse<T>>(`${API_BASE}/${path}/${encodeURIComponent(id)}`);
    const item = data['@graph']?.[0];
    if (!item) {
        throw new ApiError(404, 'Not found');
    }
    return item;
}

export const truncate = (text: string | undefined, max = 220) =>
    text && text.length > max ? `${text.slice(0, max).trimEnd()}…` : text

export function pickLanguage<T>(map: LanguageMap<T> | undefined): T | undefined {
    if (!map) {
        return undefined;
    }
    return map.en ?? map.none ?? Object.values(map)[0];
}