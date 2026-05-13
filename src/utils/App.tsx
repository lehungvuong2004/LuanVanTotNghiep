import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
import './App.css'
import { Icon } from '@iconify/react';

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <h1 className="font-medium">Đây là tiêu đề font Inter Bold</h1>
      <p className="font-light">Đây là đoạn văn font Inter Light (Weight 300)</p>
      <span className="font-inter">Cực mỏng (Weight 100)</span>
    </>
  )
}

export default App
