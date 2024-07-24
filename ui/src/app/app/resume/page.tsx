import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Personal } from "./personal";
import { SkillsAndOther } from "./skills";
import { Education } from "./education";

export default function Page() {
  return (
    <Tabs defaultValue="personal">
      <TabsList>
        <TabsTrigger value="personal">Personal</TabsTrigger>
        <TabsTrigger value="education">Education</TabsTrigger>
        <TabsTrigger value="skills">Skills</TabsTrigger>
        <TabsTrigger value="work">Work</TabsTrigger>
      </TabsList>
      <TabsContent value="personal">
        <Personal />
      </TabsContent>
      <TabsContent value="education">
        <Education />
      </TabsContent>
      <TabsContent value="skills">
        <SkillsAndOther />
      </TabsContent>
      <TabsContent value="work">
        <Personal />
      </TabsContent>
    </Tabs>
  );
}
