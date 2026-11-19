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
    type Product, type Person,
    type Organisation,
    type Topic,
    type Grant,
    type Venue,
    type Service,
    type Datasource
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
        case 'person':
            return PersonFields(item);
        case 'organisation':
            return OrganizationFields(item);
        case 'topic':
            return TopicFields(item);
        case 'grant':
            return GrantFields(item);
        case 'venue':
            return VenueFields(item);
        case 'srv_service':
            return ServiceFields(item);
        case 'datasource':
            return DatasourceFields(item);
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
                        {product.topics.map(({ term }) => (
                            <EntityLink key={term.local_identifier} path="topics" id={term.local_identifier} className="chip">
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

const PersonFields = (item: Entity) => {
    const person = item as Person;

    return (
        <>
            {person.given_name && <Field label='given name'>{person.given_name}</Field>}
            {person.family_name && <Field label='family name'>{person.family_name}</Field>}
        </>
    );
}

const OrganizationFields = (item: Entity) => {
    const organization = item as Organisation;

    return (
        <>
            {organization.other_names?.length ?
                <Field label='other_names'>{organization.other_names.join(' · ')}</Field> : null}
            {organization.website && <Field label='website'>
                <a href={organization.website} target={'_blank'} rel={'noreferrer'}>
                    {organization.website}
                </a>
            </Field>}
        </>
    );
}

const TopicFields = (item: Entity) => {
    const topic = item as Topic;
    return topic.labels ? <Field label={'topics'}><LanguageValues map={topic.labels} /></Field> : null;
}

const GrantFields = (item: Entity) => {
    const grant = item as Grant;

    return (
        <>
            {grant.titles && Object.values(grant.titles).flat().length > 1 &&
                <Field label="titles">
                    <LanguageValues map={grant.titles} />
                </Field>}
            {grant.abstracts && <Field label="abstract">
                <LanguageValues map={grant.abstracts} markdown />
            </Field>}
            {grant.acronym && <Field label="acronym">{grant.acronym}</Field>}
            {grant.grant_number && <Field label="grant number">{grant.grant_number}</Field>}
            {grant.funding_stream && <Field label="funding stream">{grant.funding_stream}</Field>}
            {grant.funded_amount !== undefined && (
                <Field label="funded amount">{grant.funded_amount.toLocaleString()}{grant.currency && ` ${grant.currency}`}</Field>
            )}
            {grant.duration && <Field label="duration">{grant.duration.start ?? '?'} – {grant.duration.end ?? '?'}</Field>}
            {grant.website && <Field label="Website"><a href={grant.website} target="_blank" rel="noreferrer">{grant.website}</a></Field>}
        </>
    );
}

const VenueFields = (item: Entity) => {
    const venue = item as Venue;

    return (
        <>
            {venue.type && <Field label="venue type">
                <span className="badge">{venue.type}</span>
            </Field>}
            {venue.acronym && <Field label="acronym">{venue.acronym}</Field>}
            {venue.series && <Field label="series">{venue.series}</Field>}
            {venue.creation_date && <Field label="created">{venue.creation_date}</Field>}
        </>
    );
}

const ServiceFields = (item: Entity) => {
    const service = item as Service;
    return (
        <>
            {service.srv_descriptions && <Field label="Description">
                <LanguageValues map={service.srv_descriptions} />
            </Field>}
            <Organisations label="hosting organisation" orgs={service.srv_has_hosting_organisation} />
            <Organisations label="research infrastructure" orgs={service.srv_has_research_infrastructure} />
            <Organisations label="relevant organisations" orgs={service.relevant_organisations} />
            {service.srv_venues?.length ? (
                <Field label="venues">
                    <ul className="plain">
                        {service.srv_venues.map((v) => (
                            <li key={v.local_identifier}>
                                {v.website ? <a href={v.website} target="_blank" rel="noreferrer">{v.name ?? v.website}</a> : (v.name ?? v.local_identifier)}
                                {v.types?.map((t) => <span key={t} className="badge">{t.replace(/^srv_/, '')}</span>)}
                            </li>
                        ))}
                    </ul>
                </Field>
            ) : null}
        </>
    );
}

const Organisations = ({ label, orgs }: { label: string; orgs?: Organisation[] }) => {
    if (!orgs?.length) {
        return null;
    }

    return (
        <Field label={label}>
            <ul className="plain">
                {orgs.map((o) => (
                    <li key={o.local_identifier}>
                        <EntityLink path="organisations" id={o.local_identifier}>
                            {o.name ?? o.local_identifier}
                        </EntityLink>
                    </li>
                ))}
            </ul>
        </Field>
    );
}

const DatasourceFields = (item: Entity) => {
    const dataSource = item as Datasource;
    return (
        <>
            {dataSource.data_source_classification && <Field label="Classification">
                <span className="badge">{dataSource.data_source_classification}</span>
            </Field>}
            {dataSource.research_product_types?.length ? (
                <Field label="Hosted product types">
                    {dataSource.research_product_types.map((t) =>
                        <span key={t} className="badge">{t}</span>)}
                </Field>
            ) : null}
        </>
    );
}
