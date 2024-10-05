import { farcasterHubContext } from "frames.js/middleware";
import { createFrames, Button } from "frames.js/next";
import { ethers } from "ethers";
import { validateAspectRatio } from "frames.js/frame-parsers";

// Token bakiyesini getiren asenkron fonksiyon
async function fetchTokenBalance(tokenAddress : any, walletAddress : any) {
  const abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  // Base ağı için provider
  const baseProvider = new ethers.JsonRpcProvider("https://mainnet.base.org");
  const contract = new ethers.Contract(tokenAddress, abi, baseProvider);

  try {
    const rawBalance = await contract.balanceOf(walletAddress);
    const decimals = await contract.decimals();
    const balance = ethers.formatUnits(rawBalance, decimals);
    
    return balance; // Bakiyeyi döndürüyoruz
  } catch (error) {
    console.error("Token bakiyesi alınamadı", error);
    return null; // Hata durumunda null döndür
  }
}

let balanceDisplay = "Token bakiyesi yüklenmedi"; // Başlangıç değeri

// Token bakiyesini kontrol etme asenkron fonksiyonu
async function handleCheckBalance(enterWalletAddress: any) {
  const tokenAddress = "0xD3C68968137317a57a9bAbeacC7707Ec433548B4";  // Token adresi
  const walletAddress = enterWalletAddress;      // Cüzdan adresi
  
  // Token bakiyesini kontrol et ve sonucu değişkenle yönet
  const balance = await fetchTokenBalance(tokenAddress, walletAddress);
  
  if (balance !== null) {
    // Sayıyı formatlamak için Intl.NumberFormat kullanıyoruz
    const formattedBalance = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0, // Ondalık kısmında en az 0 basamak göster
      maximumFractionDigits: 0, // Ondalık kısmında en fazla 0 basamak göster
    }).format(parseFloat(balance));
  
    balanceDisplay = `${formattedBalance} $SOCIAL`;
  } else {
    balanceDisplay = "This is not a valid address!";
  }
  
  return balanceDisplay; // Bakiyeyi döndür
}

const frames = createFrames({
  basePath: '/frames',
  middleware: [
    farcasterHubContext({
      ...(process.env.NODE_ENV === "production"
        ? {}
        : {
            hubHttpUrl: "http://localhost:3010/hub",
          }),
    }),
  ],
});

const handleRequest = frames(async (ctx) => {
  const searchValue = ctx.message?.inputText ? ctx.message?.inputText : "";

  // Asenkron işlem için await ekledik
  const values = await handleCheckBalance(searchValue);
  
  return {
  
    image:(
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh", // Tüm ekranı kaplasın
          minWidth: "100vw",
          background: "radial-gradient(circle, rgba(238,174,202,1) 0%, rgba(148,181,233,1) 100%)"
        }}
      >
        {ctx.message ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "helvetica",
            }}
          >   
               <h4 style={{color: "#ffffff", fontFamily: "helvetica", margin: "0", marginBottom:"10vh", fontSize:"41px", fontWeight:"bold"}}>{searchValue}</h4>
               <h3 style={{color: "#ffffff", fontFamily: "helvetica", margin: "0px", fontSize:"47px",  fontWeight:"bold",  
                border: "8px solid #ffffff", // Çerçeve rengi ve kalınlığı
                borderRadius: "30px", // Çerçevenin köşelerini yuvarlak hale getirir
                padding: "20px", // İçerikle çerçeve arasındaki boşluk
                textAlign: "center", // Yazıyı ortalar
               }}>{values}</h3>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontFamily: "helvetica"
            }}
          > 
            <h2 style={{
              color: "#475c6c", 
              fontFamily: "helvetica",
              margin: "0px", 
              marginBottom:"15vh",
              border: "2px solid #c79274", // Çerçeve rengi ve kalınlığı
              borderRadius: "30px", // Çerçevenin köşelerini yuvarlak hale getirir
              padding: "20px", // İçerikle çerçeve arasındaki boşluk
              backgroundColor: "#f9f9f9", // Arka plan rengi
              textAlign: "center", // Yazıyı ortalar
              }}>
                How much $SOCIAL do you have?</h2>
            <h4 style={{color: "#ffffff", fontFamily: "helvetica", fontSize:"45px", margin: "0px", marginBottom:"2vh", fontWeight:"bold"}}>This frame shows how much $SOCIAL</h4>
            <h4 style={{color: "#ffffff", fontFamily: "helvetica", fontSize:"45px", margin: "0px", fontWeight:"bold"}}>an entered wallet address holds in Base!</h4>

          </div>
        )}
      </div>
    ),
    textInput: "Enter a wallet address!",
    buttons: !ctx.url.searchParams.has("clicked")
      ? [
          <Button action="post" target={{ pathname: "/", query: { op: "+" } }}>
            Check $SOCIAL Amount
          </Button>,
        ]
      : [],
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
