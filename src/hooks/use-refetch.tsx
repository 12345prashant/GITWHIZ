import { useQueryClient } from '@tanstack/react-query'
import React from 'react'


// below hook ensures that the user need not to reload again and again to view the updated data , it will get upated instantly on the UI 
const useReftech = () => {
    const queryClient = useQueryClient()
  return async ()=>{
    await queryClient.refetchQueries({
        type: 'active'
    })
  }
}

export default useReftech
