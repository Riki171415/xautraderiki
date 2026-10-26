import {createContext,useContext} from 'react';
export const SupportWatchContext=createContext(null);
export function useSupportWatch(){return useContext(SupportWatchContext);}
