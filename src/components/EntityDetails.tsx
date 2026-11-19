import {useParams} from "@tanstack/react-router";
import {type EntityConfig, getEntityConfig} from "../entities.ts";
import {useQuery} from "@tanstack/react-query";
import {
    API_BASE,
    fetchOne,
    pickLanguage,
    type Entity,
    type Identifier,
    type Manifestation,
    type Product
} from "../api.ts";
import {EntityLink, Field, LanguageValues, NotFound} from "./shared.tsx";


const RESOLVERS: Record<string, (v: string) => string> = {
    doi: (v) => `https://doi.org/${v}`,
    orcid: (v) => `https://orcid.org/${v}`,
    ror: (v) => `https://ror.org/${v}`,
    handle: (v) => `https://hdl.handle.net/${v}`,
    wikidata: (v) => `https://www.wikidata.org/wiki/${v}`,
}

const identifierUrl = ({ value, scheme }: Identifier) => {
    if (/^https?:\/\//.test(value)) {
        return value;
    }
    return scheme ? RESOLVERS[scheme]?.(value) : undefined;
}

export const EntityDetailsPage = () => {
    const { entity, id } = useParams({ from: '/$entity/$id' });
    const config = getEntityConfig(entity);
    if (!config) {
        return <NotFound what={'Entity not found or supported'} />;
    }
    return EntityDetails(id, config);
};

const EntityDetails = (id: string, config: EntityConfig) => {

    const { data, isPending } = useQuery({
        queryKey: [config.path, 'entity-details', id],
        queryFn: () => fetchOne(config.path, id)
    });

    return (<article className='browser-detail'>
        {isPending && <p className="list-status">
            <span className="spinner" aria-hidden="true" />Loading…
        </p>}
        {data && (
            <>
                <p className="ost-skg-api-browser-eyebrow">{data.entity_type.replace(/^srv_/, '')}</p>
                <h1>{config.title(data)}</h1>
                <dl className="ost-skg-api-browser-fields">
                    <EntityFields item={data} />
                    <Identifiers identifiers={data.identifiers} />
                    <Field label="Local identifier">
                        <code>{data.local_identifier}</code>
                    </Field>
                </dl>
                <details className="raw">
                    <summary>JSON-LD</summary>
                    <p>
                        <a href={`${API_BASE}/${config.path}/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer">Open in API</a>
                    </p>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </details>
            </>
        )}
    </article>);
}

const EntityFields = ({ item }: { item: Entity }) => {
    switch (item.entity_type) {
        case 'product':
            return ProductFields(item);
        default:
            return null;
    }
}

const Identifiers = ({ identifiers }: { identifiers?: Identifier[] }) => {
    if (!identifiers?.length) {
        return null;
    }

    return (
        <Field label="identifiers">
            <ul className="plain">
                {identifiers.map((identifier)=> {
                    const url = identifierUrl(identifier);
                    return (
                        <li key={`${identifier.scheme}:${identifier.value}`}>
                            <span className='identifier-scheme'>{identifier.scheme ?? 'id'}</span>{' '}
                            {url ? <a href={url} target='_blank' rel='noreferrer'>{identifier.value}</a> : identifier.value}
                        </li>
                    )
                })}
            </ul>
        </Field>
    )
}

const ProductFields = (item: Entity) => {
    const product = item as Product;

    return (
        <>
            <Field label="type">
                <span className="badge">{product.product_type}</span>
            </Field>
            {product.titles && Object.values(product.titles).flat().length > 1 &&
                <Field label='titles'><LanguageValues map={product.titles}/></Field>}
            {product.abstracts &&
                <Field label='abstract'><LanguageValues map={product.abstracts} markdown/></Field>}
            {product.topics?.length ? (
                <Field label='topics'>
                    <div className='chips'>
                        {product.topics.map(({term}) => (
                            <EntityLink key={term.local_identifier} path='topics' id={term.local_identifier}
                                        className='chip'>
                                {pickLanguage(term.labels) ?? term.local_identifier}
                            </EntityLink>
                        ))}
                    </div>
                </Field>
            ) : null}
            <Manifestations manifestations={product.manifestations}/>
        </>
    )
}

const Manifestations = ({ manifestations }: { manifestations?: Manifestation[] }) => {
    if (!manifestations?.length) {
        return null;
    }
    return (<Field label={manifestations.length > 1 ? 'manifestations' : 'manifestation'}>
        {manifestations.map((manifestation: Manifestation, i: number) => {
            const dataSource = manifestation.biblio?.hosting_data_source;
            return (
                <ul key={i} className='manifestations'>
                    {manifestation.access_rights
                        && (<li>
                                <span className='scheme'>access</span>{' '}
                                {manifestation.access_rights.status}
                                {manifestation.access_rights.description && ` - ${manifestation.access_rights.description}`}
                        </li>)}
                    {manifestation.license && (<li>
                        <span className='scheme'>license</span>{' '}
                        <a href={manifestation.license} target={'_blank'} rel={'noreferrer'}>{manifestation.license}</a>
                    </li>)}
                    {dataSource && (<li>
                        <span className={'scheme'}>hosted by</span>{' '}
                        {dataSource.name ?? dataSource.local_identifier}
                    </li>)}
                </ul>
            )
        })}
    </Field>);
}