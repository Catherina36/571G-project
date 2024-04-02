import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { money } from '../assets';
import { CustomButton, FormField } from '../components';
import { checkIfImage } from '../utils';


const CreateProgram = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    target: '', 
    deadline: '',
    image: ''
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

   console.log(form);
  }

  return (
    <div className="flex justify-center items-center flex-col sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px]">
        <h1 className="font-epilogue font-bold sm:text-[30px] text-[18px] leading-[38px] text-black">Create a Program</h1>
      </div>

      <form onSubmit={handleSubmit} className="w-full mt-[65px] flex flex-col gap-[30px]">
        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Program Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange('title', e)}
          />
        </div>

        <FormField 
            labelName="Description *"
            placeholder="Write the description"
            isTextArea
            value={form.description}
            handleChange={(e) => handleFormFieldChange('description', e)}
        />

        <div className="flex flex-wrap gap-[40px]">
          <FormField 
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange('target', e)}
          />
          <FormField 
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange('deadline', e)}
          />
        </div>

        <FormField 
            labelName="Campaign image *"
            placeholder="Place image URL of your program"
            inputType="url"
            value={form.image}
            handleChange={(e) => handleFormFieldChange('image', e)}
        />

        <div className="flex justify-center items-center mt-[40px]">
            <CustomButton 
              btnType="submit"
              title="Submit"
              styles="bg-[#1dc071]"
            />
        </div>

      </form>

    </div>
  )
}

export default CreateProgram
