import React, { useContext, createContext } from 'react';

import { useAddress, useContract, metamaskWallet, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
    const { contract } = useContract('0x8367DE0Cd044A6C7C1CB183ba0252d627d71532F');
    const { mutateAsync: createProgram } = useContractWrite(contract, 'createProgram');

    const address = useAddress();
    const connect = metamaskWallet();

    const publishProgram = async(form) => {
        try {
            const data = await createProgram({
                args: [
                    address,
                    form.title, //title
                    form.description, //description
                    form.image,
                    form.target,
                    new Date(form.deadline).getTime() //deadline
                ]
            });

            console.log("contract call success", data)
        } catch (error){
            console.log("contract call failure", error)
        }
    }

    return (
        <StateContext.Provider
          value={{ 
            address,
            contract,
            createProgram: publishProgram,
          }}
        >
          {children}
        </StateContext.Provider>
      )

}

export const useStateContext = () => useContext(StateContext);