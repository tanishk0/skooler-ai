"use client";

import React from "react";
import { Evaluation, InteractionResponse, LearningEvent, LearningEventMetadata, LearningState } from "@/lib/ai/types";
import ConceptContent from "./ConceptContent";
import FeynmanChallenge from "./FeynmanChallenge";
import UserAnswerSection from "./sections/UserAnswerSection";
import EvaluationCard from "./EvaluationCard";
import ReteachSection from "./sections/ReteachSection";
import MasteredSection from "./sections/MasteredSection";
import ConceptTransitionSection from "./sections/ConceptTransitionSection";
import ModuleCompleteSection from "./sections/ModuleCompleteSection";
import SessionCompleteSection from "./sections/SessionCompleteSection";
import ChoiceInteraction from "./interactions/ChoiceInteraction";
import MultipleChoiceInteraction from "./interactions/MultipleChoiceInteraction";
import ShortAnswerInteraction from "./interactions/ShortAnswerInteraction";
import PredictionInteraction from "./interactions/PredictionInteraction";
import UnderstandingCheck from "./interactions/UnderstandingCheck";
import ContinueSection from "./sections/ContinueSection";

interface LearningTimelineProps {
  events: LearningEvent[];
  sessionStatus: "in_progress" | "completed";
  learningState?: LearningState | null;
  onSubmitAnswer: (
    responseValue: string,
    eventId?: string,
    interactionType?: InteractionResponse["type"]
  ) => void;
  onContinue?: () => void;
  isSubmitting?: boolean;
}

export const LearningTimeline: React.FC<LearningTimelineProps> = ({
  events,
  sessionStatus,
  learningState,
  onSubmitAnswer,
  onContinue,
  isSubmitting = false,
}) => {
  // The persisted FastAPI state is authoritative: historical events never
  // decide which control is editable.
  const stage = learningState?.stage || "";
  const isCompleted = sessionStatus === "completed" || stage === "complete";
  const isAwaitingContinue = !isCompleted && [
    "awaiting_continue_after_understood",
    "awaiting_continue_after_reteach",
    "awaiting_continue_after_evaluation",
    "awaiting_continue_after_concept_transition",
  ].includes(stage);
  const activeInteraction = !isCompleted && (
    stage === "awaiting_understanding_check" || stage === "awaiting_interaction_response"
  ) ? learningState?.currentInteraction : null;

  const isEvaluation = (metadata: LearningEvent["metadata"]): metadata is LearningEventMetadata & Evaluation =>
    Boolean(metadata && typeof metadata.feedback === "string" && typeof metadata.understanding === "string");

  return (
    <div className="w-full max-w-3xl flex flex-col items-center gap-6">
      {events.map((evt) => {
        const isActive = Boolean(
          activeInteraction &&
          evt.type === activeInteraction.type &&
          evt.conceptId === learningState?.currentConceptId &&
          evt.content === activeInteraction.question,
        );

        switch (evt.type) {
          case "teaching":
            return (
              <ConceptContent
                key={evt._id}
                conceptTitle={evt.conceptName || "Lesson"}
                content={evt.content}
                isMastered={Boolean(evt.metadata?.is_complete)}
              />
            );

          case "understanding_check":
            return (
              <UnderstandingCheck
                key={evt._id}
                question={evt.content}
                options={evt.metadata?.options}
                onSubmitChoice={(_optId, label) =>
                  onSubmitAnswer(_optId, evt._id, "understanding_check")
                }
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "choice":
            return (
              <ChoiceInteraction
                key={evt._id}
                question={evt.content}
                options={evt.metadata?.options}
                onSubmitChoice={(choiceId, label) =>
                  onSubmitAnswer(label, evt._id, "choice")
                }
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "feynman":
            return (
              <FeynmanChallenge
                key={evt._id}
                question={evt.content}
                onSubmitAnswer={(ans) => onSubmitAnswer(ans, evt._id, "feynman")}
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "prediction":
            return (
              <PredictionInteraction
                key={evt._id}
                question={evt.content}
                onSubmitPrediction={(pred) =>
                  onSubmitAnswer(pred, evt._id, "prediction")
                }
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "multiple_choice":
            return (
              <MultipleChoiceInteraction
                key={evt._id}
                question={evt.content}
                options={evt.metadata?.options}
                onSubmitAnswer={(_selId, label) =>
                  onSubmitAnswer(label, evt._id, "multiple_choice")
                }
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "short_answer":
            return (
              <ShortAnswerInteraction
                key={evt._id}
                question={evt.content}
                onSubmitAnswer={(ans) =>
                  onSubmitAnswer(ans, evt._id, "short_answer")
                }
                isSubmitting={isSubmitting}
                isActive={isActive}
              />
            );

          case "user_answer":
            return <UserAnswerSection key={evt._id} content={evt.content} />;

          case "evaluation":
            if (isEvaluation(evt.metadata)) {
              return (
                <EvaluationCard
                  key={evt._id}
                  evaluation={evt.metadata}
                />
              );
            }
            return null;

          case "reteach":
            return (
              <ReteachSection
                key={evt._id}
                conceptName={evt.conceptName || undefined}
                content={evt.content}
              />
            );

          case "mastered":
            return (
              <MasteredSection
                key={evt._id}
                conceptName={evt.conceptName || "Concept"}
              />
            );

          case "concept_transition": {
            const isModuleTransition =
              evt.metadata?.transition_type === "module_transition" ||
              Boolean(evt.metadata?.completed_module_name);
            if (isModuleTransition) {
              return (
                <ModuleCompleteSection
                  key={evt._id}
                  moduleName={String(evt.metadata?.completed_module_name || evt.conceptName || "Module")}
                  description={evt.content}
                />
              );
            }
            return (
              <ConceptTransitionSection
                key={evt._id}
                nextConceptName={evt.conceptName || undefined}
                content={evt.content}
              />
            );
          }

          default:
            return null;
        }
      })}

      {/* Render Continue Button Section when awaiting learner pace advancement */}
      {isAwaitingContinue && onContinue && (
        <ContinueSection
          onContinue={onContinue}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Render Session Completion Summary when the session or state is complete */}
      {isCompleted && (
        <SessionCompleteSection
          topic={learningState?.topic || "Learning Session"}
          modulesCompleted={
            learningState?.plan?.modules
              ? learningState.plan.modules.filter((m) => m.status === "mastered").length || learningState.plan.modules.length
              : undefined
          }
          totalModules={learningState?.plan?.modules?.length}
          conceptsMastered={
            learningState?.concepts
              ? learningState.concepts.filter((c) => c.status === "mastered").length || learningState.concepts.length
              : undefined
          }
          totalConcepts={learningState?.concepts?.length}
          masteryPercentage={learningState?.mastery ?? 100}
        />
      )}
    </div>
  );
};

export default LearningTimeline;
