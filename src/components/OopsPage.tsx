import { RiEmotionUnhappyLine } from "react-icons/ri";
export default function OopsPage({message}: {message: string}){
    return(
        <div className="w-full h-[calc(100vh-60px)] max-[calc(100vh-60px)] flex items-center justify-center">
            <div className="w-1/2 bg-white rounded-lg shadow-lg p-8">
                <RiEmotionUnhappyLine className="text-6xl text-red-500 mx-auto"/>
                <h1 className="text-2xl text-center font-bold mt-4">{message}</h1>
            </div>
        </div>
    )
}