import { useEffect, useState } from "react";

const ROUTES_URL = "https://m-route-backend.onrender.com/users/route-plans";


const CreateRoutes = () =>{

    const [dateRange, setDateRange] = useState({
        startDate: "",
        endDate: "",
    });
    const [instructionSets, setInstructionSets] = useState([]);
    const [staffNo, setStaffNo] = useState({
        staff_no: ""
    });
    const [userId, setUserId] = useState("");
    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const userData = localStorage.getItem("user_data");
        setToken(JSON.parse(accessToken));
        if (userData) {
            setUserId(JSON.parse(userData).id);
        }
    }, []);


    const handleDateRange = event =>{
        const {name, value} = event.target;
        setDateRange( prev => ({
            ...prev,
            [name]: value
        }))
    }


    const handleInstructionsChange = (index, event) => {
        const { name, value } = event.target;
        const updatedInstructionSets = instructionSets.map((set, i) => 
          i === index ? { ...set, [name]: value } : set
        );
        setInstructionSets(updatedInstructionSets);
      };

      const handleAddInstructionSet = () => {
        setInstructionSets([...instructionSets, { dateTime: "", instructions: "", facility: "" }]);
      };

    const handleStaffNo = event =>{
        const {name, value} = event.target;
        if (value < 0) {
            alert("Please enter a positive number.");
            return;
          }
          setStaffNo( prev => ({
            ...prev,
            [name]: value
        }))
        
    }

    const handleSubmitRoutes = async event =>{
        event.preventDefault();

        const routes = {
            manager_id: userId,
            staff_no: parseInt(staffNo.staff_no),
            status: "pending",
            date_range: {
                start_date: dateRange.startDate,
                end_date: dateRange.endDate
            },
            instructions: instructionSets
        };
        console.log(routes)

        try {
            const response = await fetch(ROUTES_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(routes)
            })

            const data = await response.json();

            if (data.status_code === 201) {
                setMessage(data.message);
                setStaffNo("");
                setInstructionSets([]);
                setDateRange({
                  startDate: "",
                  endDate: "",
                });
        
                setTimeout(() => {
                  setMessage("");
                }, 5000);

              } else if (data.status_code === 400) {
                setMessage(data.message);
                setTimeout(() => {
                  setMessage("");
                }, 5000);

              } else if (data.status_code === 500) {
                console.log(data.message);
                setMessage("There was a problem creating the route plans");
                setTimeout(() => {
                  setMessage("");
                }, 5000);
              }

        } catch (error) {
            console.log(error)
            setMessage("There was a problem creating the route plans")
            setTimeout(() =>{
                setMessage("");
            }, 5000)
        }
    }

    return (
        <form onSubmit={handleSubmitRoutes}>
           <div>
            <label htmlFor="Date rage">Date Range</label>
            <br />
            <input 
                type="date" 
                name="startDate"
                placeholder="YYYY-MM-DD"
                value={dateRange.startDate}
                onChange={handleDateRange}
                required
            />
            <small>Start Date: YYYY-MM-DD</small>
            <br />
            <input 
                type="date" 
                name="endDate"
                placeholder="YYYY-MM-DD"
                value={dateRange.endDate}
                onChange={handleDateRange}
                required
            />
            <small>End date: YYYY-MM-DD</small>
           </div>
           <br />
           <div>
            <label htmlFor="date-instructions">Activity Date</label>
            <br />
            {instructionSets.map((set, index) => (
                <div key={index}>
                    <input 
                        type="datetime-local" 
                        name="start"
                        placeholder="YYYY-MM-DD"
                        value={set.start}
                        onChange={(e) => handleInstructionsChange(index, e)}
                        required
                    />
                    <small>Start: YYYY-MM-DDTHH:MM</small>
                    <br />
                    <input 
                        type="datetime-local" 
                        name="end"
                        placeholder="YYYY-MM-DD"
                        value={set.end}
                        onChange={(e) => handleInstructionsChange(index, e)}
                        required
                    />
                    <small>End: YYYY-MM-DDTHH:MM</small>
                    <br />
                    <label htmlFor="facility">Facility Name</label>
                    <br />
                    <input 
                        type="text" 
                        name="facility"
                        placeholder="Facility name"
                        value={set.facility}
                        onChange={(e) => handleInstructionsChange(index, e)}
                        required
                    />
                    <br />
                    <label htmlFor="instructions">Instructions</label>
                    <br />
                    <textarea 
                        name="instructions" 
                        id="message" 
                        rows={4} 
                        placeholder="Instructions"
                        value={set.instructions}
                        onChange={(e) => handleInstructionsChange(index, e)}
                        required
                    />
                </div>
            ))}
            <br />
            <br />
            <button type="button" onClick={handleAddInstructionSet}>
                + Add Another Set
            </button>
           </div>
           <br />
           <div>
            <label htmlFor="staffNo">Staff Number</label>
            <br />
            <input 
                type="number" 
                name="staff_no"
                autoComplete="off"
                placeholder="Positive number (1234567899)"
                value={staffNo.staff_no}
                onChange={handleStaffNo}
                required
            />
           </div>
           <p>{message}</p>
           <button type="submit">Submit</button>
        </form>
    )

}

export default CreateRoutes;


