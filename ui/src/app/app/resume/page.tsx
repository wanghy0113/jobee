import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Personal } from "./personal";
import { SkillsAndOther } from "./skills";
import { Education } from "./education";
import { Work } from "./work";

export default function Page() {
  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
        <TabsTrigger value="skills & others">Skills & Others</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Personal />
      </TabsContent>
      <TabsContent value="education">
        <Education />
      </TabsContent>
      <TabsContent value="work">
        <Work />
      </TabsContent>
      <TabsContent value="skills & others">
        <SkillsAndOther />
      </TabsContent>
    </Tabs>
  );
}
