import {type Entity, pickLanguage, type Product, truncate} from "./api.ts";

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
    }
];

export const getEntityConfig = (path: string) =>
            ENTITIES.find((e) => e.path === path)
