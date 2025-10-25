"use client"
import MDEditor from '@uiw/react-md-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React from 'react'
import { askQuestion } from './actions'
import { readStreamableValue } from 'ai/rsc'
import CodeReferences from './code-references'

const AskQuestionCard = () => {
    const {project} = useProject()
    const [question, setQuestion] = React.useState('')
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading]= React.useState(false)
    const [filesReferences, setFileReferences] = React.useState<{fileName: string; sourceCode: string; summary: string}[]>([])
    const [answer, setAnswer] = React.useState('')

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
        setAnswer('')
        setFileReferences([])
        e.preventDefault()
        if(!project?.id) return
        setLoading(true)
        

        const {output, filesReferences} = await askQuestion(question, project.id)
        setOpen(true)
        setFileReferences(filesReferences)

        for await (const delta of readStreamableValue(output)){
            if(delta){
                setAnswer(ans=> ans + delta)
            }
        }
        setLoading(false)
    }
  return (
    <>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className='sm:max-w-[80vw]'>
                <DialogHeader>
                    <DialogTitle>
                        <Image src='/logo1.png' alt='dionysus' width={40} height={40}></Image>
                    </DialogTitle>
                </DialogHeader>

                <MDEditor.Markdown source={answer} className='max-w-[70vw] !h-full max-h-[40vh] overflow-scroll'/>
                <div className="h-4"></div>
                <CodeReferences filesReferences={filesReferences}/>
                <Button type='button' onClick={()=> {setOpen(false)}}>
                    Close
                </Button>

            </DialogContent>
            
        </Dialog>
        <Card className='relative col-span-2'>
            <CardHeader>
                <CardTitle>Ask a Question</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit}>
                    <Textarea placeholder='Which file I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)}></Textarea>
                    <div className="h-4"></div>
                    <Button type='submit' disabled={loading}>
                        Ask Dionysus!
                    </Button>
                </form>
            </CardContent>
        </Card>
    </>
  )
}

export default AskQuestionCard
