import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { cyber } from '../cyber';
import { supergraf } from '../super';



function findMultiplierByUsername(username: string): string | null {
  const user = cyber.find((user) => user.username === username);
  return user ? user.multiplier : null;
}


function findSuperByUsername(username: string): string | null {
  const user = supergraf.find((user) => user.username === username);
  return user ? user.bonus : null;
}

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
  const searchValue = ctx.message?.inputText ? ctx.message?.inputText : "";

  const multiplier = findMultiplierByUsername(searchValue);
  const supergraf = findSuperByUsername(searchValue);

  return {
    image: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh", // Tüm ekranı kaplasın
          minWidth: "100vw",
          backgroundColor: "#c2bcff", // Ana çerçevenin arka plan rengi
        }}
      >
        {ctx.message ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "'Fira Code', monospace",
              gap: "10px",
            }}
          >
            {!(multiplier || supergraf) ? (
              "Unfortunately, you did not earn any bonuses."
            ) : (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                fontFamily: "'Fira Code', monospace",
                gap: "10px",
              }}>
                Hey {ctx.message?.inputText || "User"}, here is the bonus amount
                you earn:
                <br />
                Cyber = {multiplier ? multiplier + " MULTIPLIER" : "NOT ELIGIBLE"} 
                <br />
                SuperGraph = {supergraf || 0} $SOCIAL
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            The amount of bonus you earn for Phaver Season 1
          </div>
        )}
      </div>
    ),
    textInput: "Enter phaver username",
    buttons: !ctx.url.searchParams.has("clicked")
      ? [
          <Button action="post" target={{ pathname: "/", query: { op: "+" } }}>
            Check Bonus Social!
          </Button>,
        ]
      : [],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;