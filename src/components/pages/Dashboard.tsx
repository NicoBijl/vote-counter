import Typography from "@mui/material/Typography";

export function Dashboard() {

    return (
        <>
            <Typography variant={"h4"}>
                Welcome to the Vote Counter App
            </Typography>
            <Typography paragraph={true}>
                Welcome to the Vote Counter App, your straightforward solution for counting votes. Built with the latest React technology and powered by Vite, this app offers a simple yet effective way to manage election results.
            </Typography>
            <Typography paragraph={true}>
                Here's what our app offers:
            </Typography>
            <ul>
                <li>Simple Vote Counting: Easily tally votes and get accurate results quickly.</li>
                <li>Manage Candidates and Positions: Update and manage candidates and positions with ease.</li>
                <li>Results Display: View the election results in a clear and no-fuss format.</li>
                <li>Voting Setup: Set up your election with essential features for a straightforward voting process.</li>
            </ul>
            <Typography paragraph={true}>
                Our goal is to offer an easy-to-use tool that supports your election process without complications. Start your election with the Vote Counter App today and enjoy the simplicity it brings to vote counting!
            </Typography>

        </>
    );
}