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
import { link } from "fs";

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
  const { session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: session?.resume?.firstName || "",
      lastName: session?.resume?.lastName || "",
      email: session?.resume?.email || "",
      website: session?.resume?.website || "",
      linkedin: session?.resume?.linkedin || "",
      github: session?.resume?.github || "",
      phone: session?.resume?.phone || "",
      address: session?.resume?.address || "",
      summary: session?.resume?.summary || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

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
          <Button size={"sm"} type="submit">
            Save
          </Button>
        </form>
      </Form>
    </div>
  );
}
