import Dashboard from "./dashboard";

export default function Home() {
  return (
    <>
      <div className=" flex items-center justify-center">PushPilot AI 🚀</div>
      <Dashboard />
      {/* To Do.... */}
      <div className="flex flex-col items-center justify-center">
        <p>
          1. Add campaigns tracker using monthly emailers
          2. Generate tone suggestions through campaigns
          and other monthly events
        </p>
      </div>
    </>
  );
}
