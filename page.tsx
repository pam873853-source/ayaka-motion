'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'

export default function Home(){
  const [data,setData]=useState<any[]>([])
  useEffect(()=>{ supabase.from('products').select('*').then(r=>setData(r.data||[])) },[])
  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-5xl font-black">WEB GLOBAL KANG</h1>
      <p className="opacity-60 mt-2">Connected to: jbzykcuhpfkrgnimjtxx.supabase.co ✅</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
        {data.map((p,i)=><div key={i} className="bg-zinc-900 p-4 rounded-xl">{p.name}</div>)}
      </div>
      <p className="mt-10 text-sm opacity-50">Supabase lu udah LIVE kang!</p>
    </main>
  )
}