"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "./actions";
import { ArrowRight } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const INITIAL: ContactState = { ok: false, message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      data-cursor="link"
      className="btn btn-sized btn-primary t-meta group/btn mt-12 disabled:opacity-50"
    >
      <span>{pending ? "Sending" : "Send enquiry"}</span>
      <ArrowRight className="size-3.5 transition-transform duration-[var(--dur-micro)] ease-[var(--ease-out)] group-hover/btn:translate-x-1" />
    </button>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const id = `contact-${name}`;
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="t-meta block text-ink-45">
        {label}
        {required ? <span aria-hidden> *</span> : null}
      </label>
      {textarea ? (
        <textarea
          id={id}
          name={name}
          rows={5}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field t-body mt-3 resize-y", error && "border-b-2 border-[#c0392b]")}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          autoComplete={name === "email" ? "email" : name === "name" ? "name" : "organization"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn("field t-body mt-3", error && "border-b-2 border-[#c0392b]")}
        />
      )}
      {error ? (
        // Stated in words, never signalled by colour alone.
        <p id={`${id}-error`} className="t-caption mt-2 text-[#c0392b]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, INITIAL);

  if (state.ok) {
    return (
      <div role="status" className="border-t border-ink-12 pt-10">
        <p className="t-display-2 max-w-[18ch]">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="max-w-2xl">
      <div className="grid gap-10">
        <Field name="name" label="Name" required error={state.fieldErrors?.name} />
        <Field
          name="email"
          label="Email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field name="company" label="Company" />
        <Field
          name="message"
          label="How can we help?"
          textarea
          required
          error={state.fieldErrors?.message}
        />
      </div>

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && !state.fieldErrors ? (
        <p role="alert" className="t-caption measure mt-10 text-[#c0392b]">
          {state.message}
        </p>
      ) : null}

      <Submit />
    </form>
  );
}
