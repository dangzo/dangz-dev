import { NextResponse } from 'next/server';
import { getE2EGraphQLResponse } from '@/test-support/e2e/sanity-fixtures';

interface GraphQLRequestBody {
  operationName?: unknown;
  query?: unknown;
}

export async function POST(request: Request) {
  if (process.env.E2E_FIXTURES !== 'true') {
    return new NextResponse(null, { status: 404 });
  }

  const body = await request.json() as GraphQLRequestBody;

  if (typeof body.operationName !== 'string' || typeof body.query !== 'string') {
    return NextResponse.json({ errors: [{ message: 'Invalid GraphQL request.' }] }, { status: 400 });
  }

  try {
    return NextResponse.json({
      data: getE2EGraphQLResponse({ operationName: body.operationName, query: body.query }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create E2E GraphQL response.';

    return NextResponse.json({ errors: [{ message }] }, { status: 400 });
  }
}
