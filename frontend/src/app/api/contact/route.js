export async function POST(req) {
    try {
      const { name, email, message } = await req.json();
      
      // TODO: Store this data in MongoDB
      console.log("Contact form submitted:", { name, email, message });
  
      return Response.json({ success: true, message: "Message received!" });
    } catch (error) {
      return Response.json({ success: false, error: "Failed to process request" }, { status: 500 });
    }
  }
  