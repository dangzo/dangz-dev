export const POST_LIST_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, image, tags, body, publishedAt}`;

export const TAGS_LIST_QUERY = `*[
  _type == "tag"
]|order(title asc){_id, title, "postCount": count(*[_type == "post" && references(^._id)])}`;
