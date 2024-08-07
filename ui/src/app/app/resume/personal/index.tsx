"use client";

import { useSession } from "@/app/context/session-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { updateBasicInfo } from "@/client";

const formSchema = z.object({
  firstName: z.string().min(0).max(20),
  lastName: z.string().min(0).max(20),
  email: z.string().email().optional(),
  phone: z.string().min(0).max(15).optional(),
  address: z.string().min(0).max(100).optional(),
  website: z.string().min(0).max(100).optional(),
  linkedin: z.string().min(0).max(100).optional(),
  github: z.string().min(0).max(100).optional(),
  summary: z.string().min(0).max(500).optional(),
});

export function Personal() {
  const { session, setResume } = useSession();
  console.log("session", session);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: session?.user?.userResume?.firstName || "",
      lastName: session?.user?.userResume?.lastName || "",
      email: session?.user?.userResume?.email || "",
      website: session?.user?.userResume?.website || "",
      linkedin: session?.user?.userResume?.linkedin || "",
      github: session?.user?.userResume?.github || "",
      phone: session?.user?.userResume?.phone || "",
      address: session?.user?.userResume?.address || "",
      summary: session?.user?.userResume?.summary || "",
    },
  });

  const { reset } = form;

  // Update form values when session changes
  useEffect(() => {
    reset({
      firstName: session?.user?.userResume?.firstName || "",
      lastName: session?.user?.userResume?.lastName || "",
      email: session?.user?.userResume?.email || "",
      website: session?.user?.userResume?.website || "",
      linkedin: session?.user?.userResume?.linkedin || "",
      github: session?.user?.userResume?.github || "",
      phone: session?.user?.userResume?.phone || "",
      address: session?.user?.userResume?.address || "",
      summary: session?.user?.userResume?.summary || "",
    });
  }, [session, reset]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    if (!session?.user?.userResume?.id) {
      throw new Error("No resume ID found");
    }
    updateBasicInfo({
      data: values,
      resumeId: session?.user?.userResume?.id,
    }).then((resume) => {
      console.log("updated resume", resume);
      setResume(resume);
    });
  }

  const isFormChanged = form.formState.isDirty;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }: any) => (
              <FormItem className="max-w-72">
                <FormLabel>First name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }: any) => (
              <FormItem className="max-w-72">
                <FormLabel>Last name</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input inputMode="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input inputMode="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Linkedin</FormLabel>
                <FormControl>
                  <Input inputMode="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="github"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Github</FormLabel>
                <FormControl>
                  <Input inputMode="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }: any) => (
              <FormItem className="max-w-96">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button size={"sm"} type="submit" disabled={!isFormChanged}>
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}
function reset(arg0: {
  firstName: string;
  lastName: string;
  email: string;
  website: string;
  linkedin: string;
  github: string;
  phone: string;
  address: string;
  summary: string;
}) {
  throw new Error("Function not implemented.");
}
