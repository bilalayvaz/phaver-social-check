import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";

const frames = createFrames({
  basePath: '/frames',
  middleware: [
    farcasterHubContext({
      // remove if you aren't using @frames.js/debugger or you just don't want to use the debugger hub
      ...(process.env.NODE_ENV === "production"
        ? {}
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
  ],
});

const reverseString = (str:any) => str?.split("").reverse().join("") || "";

const handleRequest = frames(async (ctx) => {

  const displayName = ctx.message?.requesterUserData?.username|| "";
  const reversedName = reverseString(displayName);

  return {

    image: <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh", // Tüm ekranı kaplasın
      minWidth: "100vw",
      backgroundColor: "#eed7a1", // Ana çerçevenin arka plan rengi

    }}> { ctx.message ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Fira Code', monospace",
          gap: "5px"
        }}
      >
        {/* GM, {ctx.message.requesterUserData?.displayName}! Your FID is{" "}
        {ctx.message.requesterFid}
        {", "}
        {ctx.message.requesterFid < 20_000
          ? "you're OG!"
          : "welcome to the Farcaster!"} */}
       <img style={{height: "200px", width: "200px"}} src={ctx.message?.requesterUserData?.profileImage} alt="farcasterImage" />
          GM GM GM <br/> Let's keep Phavering! <br/> {reversedName}
       
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px"
        }}
      >
        Hey, I'm bilalayvazoglu <br/>This is the first simple frame I coded!
      </div>
    )}</div> ,
    buttons: !ctx.url.searchParams.has("clicked")
      ? [
          <Button action="post" target={{ query: { clicked: true } }}>
            Reverse My Farcaster Name
          </Button>,
        ]
      : [],
  };
    
});

export const GET = handleRequest;
export const POST = handleRequest;
