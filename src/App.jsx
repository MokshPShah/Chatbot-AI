import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import typingGif from './assets/typing.gif'
import { FiSend } from "react-icons/fi";
import { RiDeleteBin6Fill } from "react-icons/ri";

function App() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const msgRef = useRef()

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatHistory'));
    if (savedMessages && Array.isArray(savedMessages)) {
      setMessages(savedMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  function clearChat() {
    localStorage.removeItem("chatHistory");
    setMessages([]);
  }

  async function generateAnswer() {
    if (!question.trim()) return;
    setIsLoading(true);

    const newMessage = { role: 'user', content: question };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setQuestion("");

    const API_KEY = "AIzaSyCO2MUVQ-XnWqnfABMeQ3qabB4aSB0VLBo";
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }]
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      let aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

      if (/who made you/i.test(question) || /who created you/i.test(question) || /who made you ?/i.test(question) || /who created you ?/i.test(question) || /who created u/i.test(question) || /who made u/i.test(question) || /who created u?/i.test(question) || /who made u?/i.test(question)) {
        aiResponse = "I am large language model, trained by Moksh Shah!";
      } else if (/when were you created/i.test(question) || /when did you start/i.test(question)) {
        aiResponse = "I was set up by Moksh Shah on February 21, 2025!";
      } else if (/are you Google's Gemini/i.test(question) || /are you Google's ai/i.test(question) || /are you Chatgpt's ai/i.test(question) || /are you Google ai/i.test(question)  || /are you google ai/i.test(question)) {
        aiResponse = "Nope! I'm Moksh Shah's AI.";
      }

      aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<b className="font-bold">$1</b>');
      aiResponse = aiResponse.replace(/`(.*?)`/g, '<pre className="bg-slate-900 text-white py-2 px-4 rounded-sm">$1</pre>');

      const aiMessage = { role: 'assistant', content: aiResponse };
      setMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error("Error response:", error.response?.data);
      const errorMessage = { role: 'assistant', content: "Error fetching response. Please try again." };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateAnswer();
    }
  }

  useEffect(() => {
    msgRef.current?.scrollIntoView({
      behavior: "smooth"
    })
  }, [messages])

  return (
    <>
      <div className="container my-8 mx-auto border-2 border-lime-500 rounded-2xl max-h-full">
        <div className='bg-lime-500 text-white rounded-t-[14px] py-12 text-center'>
          <h1 className='text-3xl font-bold'> AI Chatbot </h1>
        </div>
        <div className="answer h-96 p-8 mb-6 no-scrollbar overflow-scroll">
          <p className="p-5 rounded-md bg-gray-200 max-w-fit">How can I assist you today?</p>
          {messages.map((message, index) => (
            <div key={index} className={`flex my-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-5 rounded-md ${message.role === 'user' ? 'bg-gray-100 max-w-1/2' : 'bg-gray-200 max-w-2/3'}`}>
                <p dangerouslySetInnerHTML={{ __html: message.content }}></p>
              </div>
              <div ref={msgRef}></div>
            </div>
          ))}
          {isLoading && (
            <div className="text-center mt-2">
              <img src={typingGif} alt="Typing..." className="w-10" />
            </div>
          )}
        </div>
        <div className="input flex justify-evenly items-center px-14">
          <div className="bg-gray-200 text-slate-800  my-3 flex items-center px-5">
            <textarea value={question} onKeyDown={handleKeyDown} onChange={(e) => setQuestion(e.target.value)} className='w-[50vw] h-[15vh] resize-none caret-lime-600 outline-0 p-3' placeholder='Ask anything....' title='Ask anything....'></textarea>
            <button onClick={generateAnswer} disabled={question.length <= 3} title='Generate Answer' className='bg-white text-slate-500 p-2.5 disabled:bg-gray-100 disabled:text-slate-400'><FiSend /></button>
          </div>
        </div>
        <div className="flex justify-center">
          <button onClick={clearChat} className="bg-red-600 rounded-md p-2 mx-auto text-white mb-3 cursor-pointer active:bg-red-700">Clear Chat<RiDeleteBin6Fill className='inline ps-1 text-xl align-sub' /></button>
        </div>
      </div >
    </>
  )
}

export default App
