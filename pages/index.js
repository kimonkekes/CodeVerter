import { useState } from 'react';
import CodeWindow from '@/components/CodeWindow';
import background from '@/public/background.jpg';
import logo from '@/public/logo.png';
import Image from 'next/image';

export default function Home() {

  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState(``);
  const [outputCode, setOutputCode] = useState('');
  const [inputLanguage, setInputLanguage] = useState('JavaScript');
  const [outputLanguage, setOutputLanguage] = useState('Python');


  const handleInputLanguageChange = (option) => {
    setInputLanguage(option.value)
    setInputCode('')
    setOutputCode('')
  }

  const handleOutputLanguageChange = (option) => {
    setOutputLanguage(option.value)
    setOutputCode('')
  }

  const handleTranslate = async () => {
    const maxCodeLength = 6000;

    if (inputLanguage === outputLanguage) {
      alert('Please select different languages.');
      return;
    }

    if (!inputCode) {
      alert('Please enter some code.');
      return;
    }

    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters. You are currently at ${inputCode.length} characters.`,
      );
      return;
    }

    setLoading(true);
    setOutputCode('');

    const controller = new AbortController();

    const body = {
      inputLanguage,
      outputLanguage,
      inputCode
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const data = response.body;

    if (!data) {
      setLoading(false);
      alert('Something went wrong.');
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setOutputCode((prevCode) => prevCode + chunkValue);
    }

    setLoading(false);
  }

  return (
    <div className='flex-col items-center justify-center'>
      <Image className='fixed left-0 top-0 w-screen h-screen -z-10' src={background} alt='Background' />
      <div className='flex justify-center items-center mt-6 mb-20'>
        <Image className='' src={logo} alt='Logo' />
      </div>
      <div className='flex flex-row items-center'>
      <CodeWindow code={inputCode} setCode={setInputCode} loading={loading} handleLanguageChange={handleInputLanguageChange} language={inputLanguage} />

      <button disabled={loading} className='bg-[#C53AAE] hover:bg-[#40e0d0ef] border-white p-3 m-2 flex justify-center items-center rounded-lg text-white font-semibold' onClick={handleTranslate}>{loading ? `Converting...` : `Convert`}</button>

      <CodeWindow code={outputCode} setCode={setOutputCode} loading={loading} handleLanguageChange={handleOutputLanguageChange} language={outputLanguage} />
      </div>

        <div className='mt-20'>
          <blockquote className='text-2xl font-semibold italic text-center text-slate-900 tracking-wider'>
            Translate your code
            <span>&nbsp;</span>
            <span className='relative'>
              <span className='block absolute -inset-1 -skew-y-3 bg-cyan-400' aria-hidden='true'></span>
              <span className='relative text-white'>instantly</span>
            </span>
            <span>&nbsp;</span>
            to another programming language
            <br /><br />
            Or select
            <span>&nbsp;</span>
            <span className="relative">
              <span className="block absolute -inset-1 -skew-y-3 bg-cyan-400" aria-hidden="true"></span>
              <span className="relative text-white">Natural Language</span>
            </span>
            <span>&nbsp;</span>
            to describe the result you want
          </blockquote>
        </div>
      </div>
  )
}