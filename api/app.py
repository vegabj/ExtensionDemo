from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import FileResponse
from llama_cpp import Llama
from pydantic import BaseModel
from diffusers import DiffusionPipeline
import torch


def load_chat_model():
    # code_model_path = "../codellama/CodeLlama-7b-Python/ggml-model-f16.gguf"
    chat_model_path = "../llama/llama-2-7b-chat/ggml-model-f16.gguf"
    model = Llama(model_path=chat_model_path,
                  n_ctx=2048,            # context window size
                  n_gpu_layers=1,        # enable GPU
                  use_mlock=True)        # enable memory lock so not swap
    return model


def load_sdxl_model():
    base = DiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=torch.float16,
        variant="fp16",
        use_safetensors=True
    )
    base.to("mps")
    refiner = DiffusionPipeline.from_pretrained(
        "stabilityai/stable-diffusion-xl-refiner-1.0",
        text_encoder_2=base.text_encoder_2,
        vae=base.vae,
        torch_dtype=torch.float16,
        use_safetensors=True,
        variant="fp16",
    )
    refiner.to("mps")
    return base, refiner


models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    models["llama"] = load_chat_model()
    models["sdxl"] = load_sdxl_model()
    yield
    models.clear()


app = FastAPI(title="llama2-7B-python API", lifespan=lifespan)


class PromptParams(BaseModel):
    prompt: str
    max_tokens: int = 200
    temp: float = 0.2


@app.post("/prompt", tags=["LLAMA2 prompt"])
async def prompt(prompt_params: PromptParams):
    if "llama" not in models:
        return {"response": "no LLAMA2 model is loaded"}
    result = models["llama"](
        prompt=prompt_params.prompt,
        max_tokens=prompt_params.max_tokens,
        temperature=prompt_params.temp)
    return {"response": result["choices"][0]["text"]}


class SDXLParams(BaseModel):
    prompt: str
    steps: int = 40
    denoising_fraction: float = 0.8


@app.post("/generate", tags=["SDXL prompt"])
async def txt_to_img(prompt_params: SDXLParams):
    base, refiner = models["sdxl"]
    image = base(
        prompt=prompt_params.prompt,
        num_inference_steps=prompt_params.steps,
        denoising_end=prompt_params.denoising_fraction,
        output_type="latent",
    ).images
    image = refiner(
        prompt=prompt_params.prompt,
        num_inference_steps=prompt_params.steps,
        denoising_start=prompt_params.denoising_fraction,
        image=image,
    ).images[0]
    image_path = f"api/generated_images/{id(image)}.png"
    image.save(image_path, "PNG")
    return FileResponse(image_path, status_code=201)
