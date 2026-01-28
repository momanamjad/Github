import { GitHubCalendar } from "react-github-calendar";
import { Tooltip } from "react-tooltip";
// const LEVELS = [
//   "bg-[#161b22]",
//   "bg-[#0e4429]",
//   "bg-[#006d32]",
//   "bg-[#26a641]",
//   "bg-[#39d353]",
// ];

// const ContributionGraph = () => {
//   const data = generateContributions();

//   return (
//     <section className="px-4 mt-8">
//       {/* Header */}
//       <h2 className="font-semibold mb-2">
//         208 contributions in the last year
//       </h2>

//       <div className="overflow-x-auto">
//         <div className="inline-block">
//           {/* Month Labels */}
//           <div className="flex mb-2 ml-8 text-[12px] text-github-muted">
//             {[
//               "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
//             ].map((month, i) => (
//               <span key={i} className="w-[52px]">
//                 {month}
//               </span>
//             ))}
//           </div>

//           <div className="flex">
//             {/* Day Labels */}
//             <div className="flex flex-col justify-between mr-2 text-[12px] text-github-muted h-[110px]">
//               <span>Mon</span>
//               <span>Wed</span>
//               <span>Fri</span>
//             </div>

//             {/* Grid */}
//             <div className="flex gap-[2px]">
//               {data.map((week, wIdx) => (
//                 <div key={wIdx} className="flex flex-col gap-[2px]">
//                   {week.map((level, dIdx) => (
//                     <div
//                       key={dIdx}
//                       className={`w-[10px] h-[10px] rounded-sm ${LEVELS[level]}`}
//                     />
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-between mt-3 text-[12px] text-github-muted">
//             <span>Less</span>
//             <div className="flex gap-[2px]">
//               {LEVELS.map((c, i) => (
//                 <div
//                   key={i}
//                   className={`w-[10px] h-[10px] rounded-sm ${c}`}
//                 />
//               ))}
//             </div>
//             <span>More</span>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// function generateContributions() {
//   const weeks = 53;
//   const days = 7;

//   return Array.from({ length: weeks }, () =>
//     Array.from({ length: days }, () =>
//       Math.floor(Math.random() * 5)
//     )
//   );
// }
function ContributionGraph({ username }) {
  return (
    <section className="px-4 mt-8">
      <GitHubCalendar
        username={username}
        blockSize={10}  
        blockMargin={4}  
        blockRadius={2}
        fontSize={12}
        tooltips={true}
        theme={{
          light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
          dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
        }}
      />
    </section>
  );
}

export default ContributionGraph;
