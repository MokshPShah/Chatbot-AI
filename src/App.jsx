import { useState } from 'react'
import axios from 'axios'
import { FiSend } from "react-icons/fi";
import typingGif from './assets/typing.gif'

function App() {
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  async function generateAnswer() {
    if (!question.trim()) return;
    setIsLoading(true)

    const newMessage = { role: 'user', content: question }
    setMessages([...messages, newMessage]);
    setQuestion("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDXKUGL4R1sALNvLhQDjOmppUKoN6l43dU`,
        {
          contents: [{ parts: [{ text: question }] }]
        }
      );

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";
      const aiMessage = { role: 'assistant', content: aiResponse };
      setMessages([...messages, newMessage, aiMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant', content: "Error fetching response. Please try again." };
      setMessages([...messages, { role: 'user', content: question }, errorMessage]);
      console.error("Error:", error);
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
  return (
    <>
      <div className="container my-8 mx-auto border-2 border-blue-600 rounded-2xl max-h-full">
        <h1 className='text-center text-3xl bg-blue-600 text-white rounded-t-[14px] py-12 font-bold'>AI Chatbot</h1>
        <div className="answer h-96 p-8 mb-6 no-scrollbar overflow-scroll gap-y-4">
          <p className="p-5 rounded-md bg-gray-200 max-w-fit">How can I assist you today?</p>
          {messages.map((message, index) => (
            <div key={index} className={`flex mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-5 rounded-md ${message.role === 'user' ? 'bg-gray-100 max-w-fit' : 'bg-gray-200 max-w-2/3'}`}>
                <p>{message.content}</p>
              </div>
            </div>

          ))}
          {isLoading && (
            <div className="text-center mt-2">
              <img src={typingGif} alt="Typing..." className="w-10 mx-auto" />
            </div>
          )}
        </div>
        <div className="input flex justify-evenly items-center border-t-1 border-t-blue-800 px-14">
          <div className="outline-1 outline-blue-600  my-3 flex items-center px-5">
            <textarea value={question} onKeyDown={handleKeyDown} onChange={(e) => setQuestion(e.target.value)} cols="120" rows="5" className='h-[5vw] resize-none caret-blue-600 outline-0 p-3' placeholder='Ask anything....'></textarea>
            <button onClick={generateAnswer} disabled={question <= 3} className='bg-blue-200 text-blue-700 p-2.5 disabled:bg-blue-100 disabled:text-blue-500'><FiSend /></button>
          </div>
        </div>
      </div >
    </>
  )
}

export default App