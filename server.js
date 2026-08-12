require("dotenv").config();
const express=require("express"), cors=require("cors"), path=require("path"), OpenAI=require("openai");
const app=express(); app.use(cors()); app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"..")));
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

app.post("/api/chat",async(req,res)=>{
  try{
    const messages=Array.isArray(req.body.messages)?req.body.messages.slice(-30):[];
    const response=await client.responses.create({
      model:process.env.OPENAI_MODEL||"gpt-5-mini",
      instructions:"You are medk, a helpful, intelligent personal assistant. Be clear, practical, friendly, and honest about what you can and cannot control. Never claim to have performed a phone action unless the connected device/shortcut confirms it.",
      input:messages.map(m=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content)}))
    });
    res.json({reply:response.output_text||"I couldn't generate a response."});
  }catch(e){console.error(e);res.status(500).json({error:"AI request failed. Check OPENAI_API_KEY and server logs."});}
});
const port=process.env.PORT||3000; app.listen(port,()=>console.log("TopXP AI running on "+port));