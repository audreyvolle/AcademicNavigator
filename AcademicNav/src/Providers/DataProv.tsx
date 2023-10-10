import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import rawData from '../data/scraped/class.json';

type PrerequisiteType = {
    id: string;
    Grade: string;
    concurrency: boolean;
};

type TransformedData = {
    id: string;
    title: string;
    credits: number;
    prerequisitesRaw: string;
    prerequisitesOR: PrerequisiteType[];
    prerequisitesAND: PrerequisiteType[];
    prerequisitesANDTaken: string[];
    prerequisitesORTaken: string[];
    isReadyToTake: boolean;
    taken: boolean;
    description: string;
    number: number;
    semester: string;
};

export interface exportedValue {
    courses: TransformedData[];
}

const initialState:exportedValue = {
    courses: [
        {
            id: "",
            title: "",
            credits: 0,
            prerequisitesRaw: "",
            prerequisitesOR: [],
            prerequisitesAND: [],
            prerequisitesANDTaken: [],
            prerequisitesORTaken: [],
            isReadyToTake: false,
            taken: false,
            description: "",
            number: 1,
            semester: "",
        }
    ],
};

export const DataContext = createContext<exportedValue>(initialState);


export const DataProvider = ({children}: { children: ReactNode}) => {
    const [courses, setCourses] = useState<TransformedData[]>([]);
    
    useEffect(() => {

        const transformedData: TransformedData[] = rawData.map(item => {
            const idMatch = item.match(/(\w+\s\d+\w?)/);
            const titleMatch = item.match(/-\s(.*?)\n/);
            const descriptionMatch = item.match(/Description: (.*?)\n\n/);
            const prerequisitesRaw = item.match(/Prerequisite\(s\): (.*?)\n/);
            const creditsMatch = item.match(/Credit Hours: (\d+)/);
            const prerequisitesOR: PrerequisiteType[] = [];
            const prerequisitesAND: PrerequisiteType[] = [];
            let number = 1;
            if(prerequisitesRaw){
                if(idMatch![1] === "CHEM 121A" || idMatch![1] === "CHEM 131"){
                    prerequisitesOR.push({
                        id: "MATH 120",
                        Grade: "C",
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: "MATH 120E",
                        Grade: "C",
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: "MATH 120I",
                        Grade: "C",
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: "MATH 125",
                        Grade: "C",
                        concurrency: true,
                    });
                    prerequisitesOR.push({
                        id: "MATH 145",
                        Grade: "C",
                        concurrency: true,
                    });
                    prerequisitesOR.push({
                        id: "MATH 150",
                        Grade: "C",
                        concurrency: true,
                    });
                    prerequisitesAND.push({
                        id: "CHEM 113",
                        Grade: "C",
                        concurrency: false,
                    });
                } else if(prerequisitesRaw[1].includes("ACT")){
                    // Do nothing
                    
                } else if(idMatch![1].includes("ECE 441")){
                    prerequisitesOR.push({
                        id: `ECE 341`,
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("ECE 444")){
                    prerequisitesOR.push({
                        id: `ECE 326`,
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("PHYS 142")){
                    prerequisitesOR.push({
                        id: `PHYS 141`,
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: `PHYS 151`,
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: `MATH 152`,
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: `PHYS 151L`,
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("BIOL 240A")){
                    prerequisitesAND.push({
                        id: "BIOL 140",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: "BIOL 120A",
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("PBHE 490")){
                    prerequisitesAND.push({
                        id: "PBHE 370",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: "PBHE 375",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: "PBHE 305",
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("PBHE 498")){
                    prerequisitesOR.push({
                        id: "PBHE 491",
                        Grade: 'C',
                        concurrency: true,
                    });
                    prerequisitesAND.push({
                        id: "HED 491",
                        Grade: 'C',
                        concurrency: true,
                    });
                } else if(idMatch![1].includes("PSYC 303")){
                    prerequisitesOR.push({
                        id: "PSYC 314",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: "BIOL 140",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: "PSYC 111",
                        Grade: 'C',
                        concurrency: false,
                    });
                } else if(idMatch![1].includes("SOC 383")){
                    //do nothing   
                } else if(idMatch![1].includes("SOCW 420")){
                    //do nothing   
                    prerequisitesOR.push({
                        id: "ENG 101",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesOR.push({
                        id: "ENG 101E",
                        Grade: 'C',
                        concurrency: false,
                    });
                    prerequisitesAND.push({
                        id: "ENG 102",
                        Grade: 'C',
                        concurrency: false,
                    });
                }
                 else {
                    const beforeOR = prerequisitesRaw[1].split(" OR ");
                    for(let i = 0; i < beforeOR.length; i++) {
                        if(beforeOR[i].includes("Minimum Grade of")){
                            if(beforeOR[i].includes("AND")){
                                let sub = beforeOR[i].split(" AND ");
                                for(let j = 0; j < sub.length; j++){
                                    //each and prerequisite
                                    let secPre: PrerequisiteType = {
                                        id: "",
                                        Grade: "PASS",
                                        concurrency: false,
                                    };

                                    if(sub[j].includes("concurrency")){
                                        secPre.concurrency = true;
                                        sub[j] = sub[j].replace(" (concurrency allowed)", "");
                                    }

                                    if(sub[j][0]=== "("){
                                        sub[j] = sub[j].slice(1);
                                        prerequisitesOR.push({
                                            id: sub[j].split(" Minimum Grade of ")[0],
                                            Grade: sub[j].split(" Minimum Grade of ")[1],
                                            concurrency: secPre.concurrency,
                                        });
                                    }

                                    else if((sub[j][sub[j].length - 1] === ")") && !(sub[j].includes("concurrency"))){
                                        sub[j] = sub[j].slice(0, sub[j].length - 1);
                                    
                                        let subSplit = sub[j].split(" Minimum Grade of ");
                                        secPre.id = subSplit[0];
                                        if(subSplit[1])
                                            secPre.Grade = subSplit[1];
                                        prerequisitesAND.push(secPre);
                                    }
                                    else {
                                        let subSplit = sub[j].split(" Minimum Grade of ");
                                        secPre.id = subSplit[0];
                                        if(subSplit[1])
                                            secPre.Grade = subSplit[1];
                                        prerequisitesAND.push(secPre);
                                    }
                                }
                            } else {
                                let secPre: PrerequisiteType = {
                                    id: "",
                                    Grade: "D",
                                    concurrency: false,
                                };
                                if(beforeOR[i][0] === "("){
                                    //some of the prerequisites have a ( at the beginning so we have to delete it
                                    beforeOR[i] = beforeOR[i].slice(1);
                                }

                                if(beforeOR[i].includes("concurrency")){
                                    secPre.concurrency = true;
                                    beforeOR[i] = beforeOR[i].replace(" (concurrency allowed)", "");
                                }

                                if((beforeOR[i][beforeOR[i].length - 1] === ")") && !(beforeOR[i].includes("concurrency"))){
                                    beforeOR[i] = beforeOR[i].slice(0, beforeOR[i].length - 1);
                                }
                                
                                let subSplit = beforeOR[i].split(" Minimum Grade of ");
                                secPre.id = subSplit[0];
                                if(subSplit[1])
                                    secPre.Grade = subSplit[1];
                                prerequisitesOR.push(secPre);
                            }
                        } else if (beforeOR[i].includes("Complete all Foundations Requirements: ")) {
                            const temp = beforeOR[i].split("Complete all Foundations Requirements: ");
                            const temp2 = temp[1].split(", ");
                            for(let j = 0; j < temp2.length; j++){
                                if(temp2[j].includes("and")) {
                                    const temp3 = temp2[j].split(" and ");
                                    for(let k = 0; k < temp3.length; k++){
                                        let secPre: PrerequisiteType = {
                                            id: "",
                                            Grade: "PASS",
                                            concurrency: false,
                                        };
                                        if(temp3[k].includes("and")){
                                            //and Foundation Quantitative Reasoning courses. Get rid of and 
                                            temp3[k] = temp3[k].split("and ")[1];
                                        }
                                        if(temp3[k].includes("331")){
                                            secPre.id = "MGMT 331";
                                            secPre.concurrency = true;
                                        } else if(temp3[k].includes("102")){
                                            secPre.id = "SPAN 102";
                                        } else {
                                            if(temp3[k].includes("minimum grade of")){
                                                let split = temp3[k].split(" with minimum grade of ");
                                                secPre.id = split[0];
                                                secPre.Grade = split[1][0];
                                            } else {
                                                if(temp3[k].includes("courses")){
                                                    secPre.id = "Foundation Quantitative Reasoning";
                                                } else {
                                                    secPre.id = temp3[k];
                                                }
                                            }
                                        }
                                        prerequisitesAND.push(secPre);
                                    }
                                }
                                else {
                                    let secPre: PrerequisiteType = {
                                        id: "",
                                        Grade: "PASS",
                                        concurrency: false,
                                    };

                                    secPre.id = temp2[j];
                                    prerequisitesAND.push(secPre);
                                }
                            }
                        } else if(beforeOR[i].includes("Complete")) {
                            if(beforeOR[i].includes("ACS")){
                                //get first ACS class ID
                                const temp = beforeOR[i].split(" and ");
                                const temp2 = temp[0].split("Complete ");
                                const classId = temp2[1].split(" with a ");
                                const grade = classId[1].split(" or ");
                                prerequisitesAND.push({
                                    id: classId[0],
                                    Grade: grade[0],
                                    concurrency: false,
                                });

                                //get OR classes
                                let allClasses = temp[1].split(", ");
                                const temp4 = allClasses[allClasses.length - 1].split(" with a ");
                                allClasses[allClasses.length - 1] = temp4[0];
                                const gradeOr = temp4[1][0];
                                for(let j = 0; j < allClasses.length; j++){
                                    if(allClasses[j].includes("one ACS elective from the following: ")){
                                        const temp3 = allClasses[j].split("one ACS elective from the following: ");
                                        prerequisitesOR.push({
                                            id:temp3[i],
                                            Grade: gradeOr,
                                            concurrency: false,
                                        });
                                    } else {
                                        prerequisitesOR.push({
                                            id:`ACS ${allClasses[j]}`,
                                            Grade: gradeOr,
                                            concurrency: false,
                                        });
                                    }
                                }
                            } else if (beforeOR[i].includes(",")){
                                if(beforeOR[i].includes("with")){
                                    const temp = beforeOR[i].split(" with ");
                                    temp[0] = temp[0].split("Complete ")[1];
                                    if(temp[0].includes(",")){
                                        const temp2 = temp[0].split(", ");
                                        for(let j=0; j < temp2.length; j++){
                                            if(temp2[j].includes("ART")){
                                                if(temp2[j].includes("and")){
                                                    const temp3 = temp2[j].split(" and ");
                                                    prerequisitesAND.push({
                                                        id: temp3[0],
                                                        Grade: 'C',
                                                        concurrency: false,
                                                    });
                                                } else if (temp2[j].includes("or")){
                                                    const temp3 = temp2[j].split(" or ");
                                                    prerequisitesOR.push({
                                                        id: temp3[0],
                                                        Grade: 'C',
                                                        concurrency: false,
                                                        
                                                    });
                                                    prerequisitesOR.push({
                                                        id: `ART ${temp3[1]}`,
                                                        Grade: 'C',
                                                        concurrency: false,
                                                    });
                                                } else {
                                                    prerequisitesOR.push({
                                                        id: `${temp2[j]}`,
                                                        Grade: 'C',
                                                        concurrency: false,
                                                    });
                                                }
                                            } else {
                                                prerequisitesOR.push({
                                                    id: `ART ${temp2[j]}`,
                                                    Grade: 'C',
                                                    concurrency: false,
                                                });
                                            }
                                        }
                                    } else {
                                        if(temp[0].includes("and")){
                                            const temp2 = temp[0].split(" and ");
                                            prerequisitesAND.push({
                                                id: temp2[0],
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesAND.push({
                                                id: `ART ${temp2[1]}`,
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                        } else {
                                            prerequisitesAND.push({
                                                id: `${temp[0]}`,
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                        }
                                    }
                                }
                            } else if (beforeOR[i].includes("with")) {
                                if(beforeOR[i].includes("GM")){
                                    let temp = beforeOR[i].split(" with ");
                                    temp[0] = temp[0].split("Complete ")[1];
                                    if(temp[0].includes("and")){
                                        const temp2 = temp[0].split(" and ");
                                        prerequisitesAND.push({
                                            id: temp2[0],
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                        prerequisitesAND.push({
                                            id: `ART ${temp2[1]}`,
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                    } else if(temp[0].includes("or")) {
                                        const temp2 = temp[0].split(" or ");
                                        prerequisitesOR.push({
                                            id: temp2[0],
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                        prerequisitesOR.push({
                                            id: `ART ${temp2[1]}`,
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                    } else {
                                        prerequisitesOR.push({
                                            id: `${temp[0]}`,
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                    }
                                } else {
                                    if(beforeOR[i].includes("HONS")){
                                        if(beforeOR[i].includes("grade of C")){
                                            let temp = beforeOR[i].split(" grade of C ");
                                            temp[0] = temp[0].split("Complete ")[1];
                                            let temp2 = temp[0].split(" with");
                                            prerequisitesOR.push({
                                                id: temp2[0],
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            if(temp[1].includes("and")){
                                                prerequisitesAND.push({
                                                    id: "HONS 121",
                                                    Grade: 'C',
                                                    concurrency: false,
                                                });
                                            }
                                        }
                                    } else {
                                        if(idMatch![1] === "NURS 240"){
                                            prerequisitesAND.push({
                                                id: "BIOL 240A",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesAND.push({
                                                id: "BIOL 240B",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesAND.push({
                                                id: "BIOL 250",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesOR.push({
                                                id: "CHEM 120B",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesOR.push({
                                                id: "CHEM 120N",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                        }
                                    }
                                }
                            } else {
                                if(beforeOR[i].includes("GM") && beforeOR[i].includes("or")){
                                    let temp = beforeOR[i].split(" or ");
                                    temp[0] = temp[0].split("Complete ")[1];
                                    prerequisitesAND.push({
                                        id: temp[0],
                                        Grade: 'C',
                                        concurrency: false,
                                    });
                                } else {
                                    if(beforeOR[i] === "Complete 2 courses from HIST 300-499."){
                                        number = 2;
                                    }
                                }
                            }
                        } else if(beforeOR[i].includes("and")) {
                            const temp = beforeOR[i].split(" and ");
                            for(let j = 0; j < temp.length; j++){
                                if(temp[j].includes("with")){
                                    const temp2 = temp[j].split(" with ");
                                    if(temp2[0] === "319"){
                                        prerequisitesAND.push({
                                            id: "BIOL 319",
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                    } else {
                                        if(temp2[0].includes(",") && temp2[0].includes("PHYS 132")){
                                            prerequisitesAND.push({
                                                id: "PHYS 132",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                            prerequisitesAND.push({
                                                id: "PHYS 132L",
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                        } else {
                                            prerequisitesAND.push({
                                                id: temp2[0],
                                                Grade: 'C',
                                                concurrency: false,
                                            });
                                        }
                                    }
                                } else {
                                    if(!temp[j].includes("GPA")){
                                        prerequisitesAND.push({
                                            id: temp[j],
                                            Grade: 'C',
                                            concurrency: false,
                                        });
                                    }
                                }
                            }
                        }  else {
                            if(beforeOR[i].includes("ALEKS")){
                                //do nothing
                            } else{
                                if(beforeOR[i].includes("concurrency")){
                                    prerequisitesOR.push({
                                        id: beforeOR[i].split(" (concurrency allowed)")[0],
                                        Grade: 'C',
                                        concurrency: true,
                                    });
                                } else {
                                    prerequisitesOR.push({
                                        id: beforeOR[i],
                                        Grade: 'C',
                                        concurrency: false,
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return {
                id: idMatch ? idMatch[1] : "",
                title: titleMatch ? titleMatch[1] : "",
                credits: creditsMatch ? parseInt(creditsMatch[1], 10) : 0,
                prerequisitesRaw: prerequisitesRaw ? prerequisitesRaw[1] : "",
                prerequisitesANDTaken: [],
                prerequisitesORTaken: [],
                isReadyToTake: false,
                taken: false,
                description: descriptionMatch ? descriptionMatch[1] : "",
                prerequisitesAND: prerequisitesAND,
                prerequisitesOR: prerequisitesOR,
                number: number,
                semester: "",
            };
        });
    
        setCourses(transformedData);
        console.log(transformedData);
      }, []);

    const value = {
        courses,
    };
    return (
        <>
            <DataContext.Provider value={value}>{children}</DataContext.Provider>
        </>
    );
};

export function useData() {
    return useContext(DataContext);
}