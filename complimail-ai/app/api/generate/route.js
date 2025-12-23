export async function POST(req) {
  try {
    const body = await req.json();

    return Response.json({
      success: true,
      message: "API connected",
      received: body,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
