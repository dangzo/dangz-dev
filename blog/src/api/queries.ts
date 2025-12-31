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
