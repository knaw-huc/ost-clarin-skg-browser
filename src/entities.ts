import {
    type Entity,
    type Grant,
    type Organisation,
    type Person,
    pickLanguage,
    type Product, type Service,
    type Topic,
    truncate, type Venue
} from "./api.ts";

export interface EntityConfig {
    path: string;
    label: string;
    title: (item: Entity) => string;
    subtitle: (item: Entity) => string | undefined;
}

export const ENTITIES: EntityConfig[] = [
    {
        path: 'products',
        label: 'Products',
        title: (item: Entity) => pickLanguage((item as Product).titles)?.[0] ?? item.local_identifier,
        subtitle: (item: Entity) => truncate(pickLanguage((item as Product).abstracts)?.[0]),
    },
    {
        path: 'persons',
        label: 'Persons',
        title: (item) => (item as Person).name ?? item.local_identifier,
        subtitle: (item) => item.identifiers?.map((i) => `${i.scheme ?? 'id'}: ${i.value}`).join(' · '),
    },
    {
        path: 'organisations',
        label: 'Organisations',
        title: (item) => (item as Organisation).name ?? item.local_identifier,
        subtitle: (item) => (item as Organisation).website,
    },
    {
        path: 'topics',
        label: 'Topics',
        title: (item) => pickLanguage((item as Topic).labels) ?? item.local_identifier,
        subtitle: (item) => {
            const labels = (item as Topic).labels
            return labels && Object.keys(labels).length > 1 ? Object.values(labels).join(' · ') : undefined
        },
    },
    {
        path: 'grants',
        label: 'Grants',
        title: (item) => {
            const g = item as Grant
            return pickLanguage(g.titles)?.[0] ?? g.acronym ?? (g.grant_number ? `Grant ${g.grant_number}` : item.local_identifier)
        },
        subtitle: (item) => {
            const g = item as Grant;
            return truncate(pickLanguage(g.abstracts)?.[0]) ?? (g.titles || g.acronym ? g.grant_number : undefined)
        },
    },
    {
        path: 'venues',
        label: 'Venues',
        title: (item) => (item as Venue).name ?? item.local_identifier,
        subtitle: (item) => {
            const v = item as Venue;
            return [v.type, v.acronym, v.series].filter(Boolean).join(' · ') || undefined
        },
    },
    {
        path: 'services',
        label: 'Services',
        title: (item) => (item as Service).name ?? item.local_identifier,
        subtitle: (item) => truncate(pickLanguage((item as Service).srv_descriptions)?.[0]),
    },
    {
        path: 'datasources',
        label: 'Datasources',
        title: (item) => (item as Service).name ?? item.local_identifier,
        subtitle: (item) => truncate(pickLanguage((item as Service).srv_descriptions)?.[0]),


    }
];

export const getEntityConfig = (path: string) =>
            ENTITIES.find((e) => e.path === path)
