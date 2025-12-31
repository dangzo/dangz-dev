export const POST_LIST_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  image,
  tags[]->{_id, name, "slug": slug.current},
  body,
  publishedAt
}`;

export const TAGS_WITH_COUNT_QUERY = `*[_type == "tag"]{
  _id,
  name,
  "slug": slug.current,
  "postCount": count(*[_type == "post" && references(^._id)])
} | order(name asc)`;
