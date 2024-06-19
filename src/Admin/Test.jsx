import { useState } from "react";

const Test = () =>{

    const [responses, setResponses] = useState({})

    const instructions = [];
    return (
        <form action="submit">
            {instructions.map((instruction, index) =>{
                <div key={index}>
                    <label htmlFor="Instructions">{instructions}</label>
                    <input 
                        type="text" 
                        name= "text"
                        placeholder="Enter Response"
                        value={responses[instruction]["text"]}
                        onChange={e =>setResponses(e.target.value)}
                    />
                    <input 
                        type="file" 
                        name="image"
                        value={responses[instruction]["image"]}
                        onChange={e => setResponses(e.target.value)}
                    />
                </div>
            })

            }
            <button>Cancel</button>
            <button>Submit</button>
        </form>
    )
}