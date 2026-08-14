"""
cognee_client.py
Cognee Cloud V2 Client
"""
import os, asyncio
from dotenv import load_dotenv
load_dotenv()

COGNEE_API_KEY  = os.getenv("COGNEE_API_KEY", "")
COGNEE_BASE_URL = os.getenv("COGNEE_BASE_URL", "")

_connected     = False
_connect_lock  = asyncio.Lock()
_last_key      = None
_last_url      = None


def _dataset(patient_id: str) -> str:
    return f"patient_{patient_id}"


async def connect():
    """
    Connect to Cognee Cloud.
    Only re-serves when keys actually changed or not yet connected —
    avoids leaking a new aiohttp session on every call.
    """
    global _connected, COGNEE_API_KEY, COGNEE_BASE_URL, _last_key, _last_url

    # Reload env every call (Settings page / header middleware may update them)
    COGNEE_API_KEY  = os.getenv("COGNEE_API_KEY", "")
    COGNEE_BASE_URL = os.getenv("COGNEE_BASE_URL", "")

    if not COGNEE_API_KEY:
        raise ValueError("COGNEE_API_KEY not configured")
    if not COGNEE_BASE_URL:
        raise ValueError("COGNEE_BASE_URL not configured")

    keys_changed = (COGNEE_API_KEY != _last_key) or (COGNEE_BASE_URL != _last_url)

    if _connected and not keys_changed:
        return

    async with _connect_lock:
        # Re-check inside the lock — another request may have already connected
        if _connected and not keys_changed:
            return

        import cognee
        try:
            await asyncio.wait_for(
                cognee.serve(
                    url=COGNEE_BASE_URL,
                    api_key=COGNEE_API_KEY,
                ),
                timeout=4.0
            )
        except Exception as e:
            print(f"[Cognee] serve() failed or timed out: {e}")
            raise ValueError(f"Cognee Cloud is not responding: {e}")
        _connected = True
        _last_key  = COGNEE_API_KEY
        _last_url  = COGNEE_BASE_URL
        print(f"[Cognee] Connected to {COGNEE_BASE_URL}")


async def cognee_health_check() -> bool:
    """Verify Cognee configuration AND that the API key is valid.
    
    cognee.serve() only establishes a connection — it does NOT verify
    the API key. We do a lightweight recall probe to confirm the key
    is accepted. A 401 means the key is wrong.
    """
    try:
        await connect()
    except Exception as e:
        print(f"[Cognee] Health check failed (connect): {e}")
        return False

    # Probe: try a recall to verify credentials
    try:
        import cognee
        await cognee.recall(
            query_text="health_check_probe",
            datasets=["__healthcheck__"],
        )
        # If it succeeds, great — key is valid
        print("[Cognee] Health check passed (recall succeeded)")
        return True
    except Exception as e:
        err_str = str(e).lower()
        # 404 "prerequisites not met" = key is valid, just no data yet
        if "404" in err_str or "prerequisites" in err_str or "not found" in err_str:
            print("[Cognee] Health check passed (key valid, no data yet)")
            return True
        # 401 = bad API key
        if "401" in err_str or "unauthorized" in err_str:
            print(f"[Cognee] Health check FAILED — API key is invalid (401 Unauthorized)")
            global _connected
            _connected = False
            return False
        # Other errors — connection works but something else went wrong
        print(f"[Cognee] Health check warning: {e} (treating as connected)")
        return True


# --------------------------------------------------
# REMEMBER — with one retry on transient failure
# --------------------------------------------------
async def cognee_remember(text: str, patient_id: str):
    """Store permanent memory and build Knowledge Graph on Cognee Cloud."""
    await connect()
    import cognee
    dataset_name = _dataset(patient_id)

    for attempt in range(2):
        try:
            # 1. Add document to Cognee Cloud dataset
            try:
                await cognee.add(text, dataset_name=dataset_name)
                print(f"[Cognee] add() complete for {dataset_name}")
            except Exception as add_err:
                print(f"[Cognee] add() warning: {add_err}")

            # 2. Cognify document to extract entities and build Knowledge Graph
            try:
                await cognee.cognify(datasets=[dataset_name])
                print(f"[Cognee] cognify() Knowledge Graph complete for {dataset_name}")
            except Exception as cog_err:
                print(f"[Cognee] cognify() warning: {cog_err}")

            # 3. Store in Cognee session memory
            await cognee.remember(
                text,
                dataset_name=dataset_name,
            )
            print(f"[Cognee] remember() complete for {dataset_name}")
            clear_recall_cache(patient_id)
            return
        except Exception as e:
            print(f"[Cognee] remember() attempt {attempt+1} failed: {e}")
            if attempt == 0:
                global _connected
                _connected = False
                try:
                    await connect()
                except Exception as reconnect_err:
                    print(f"[Cognee] reconnect failed: {reconnect_err}")
                    raise
                await asyncio.sleep(0.5)
            else:
                raise


import time

_recall_cache = {}

def clear_recall_cache(patient_id: str = None):
    """Invalidate cache for a specific patient, or all patients if None."""
    global _recall_cache
    if not patient_id:
        _recall_cache = {}
        return
        
    keys_to_del = [k for k in _recall_cache.keys() if k.startswith(f"{patient_id}::")]
    for k in keys_to_del:
        del _recall_cache[k]
    if keys_to_del:
        print(f"[Cognee] Cleared {len(keys_to_del)} cache entries for {patient_id}")

# --------------------------------------------------
# RECALL
# --------------------------------------------------
async def cognee_recall(query: str, patient_id: str):
    cache_key = f"{patient_id}::{query}"
    now = time.time()
    
    # Return cached results if less than 5 minutes old
    if cache_key in _recall_cache and (now - _recall_cache[cache_key]['time']) < 300:
        print(f"[Cognee] Serving cached recall() for {cache_key}")
        return _recall_cache[cache_key]['results']

    await connect()
    import cognee
    try:
        results = await cognee.recall(
            query_text=query,
            datasets=[_dataset(patient_id)],
        )
        print(f"[Cognee] recall() returned {len(results) if results else 0} results")
        
        # Save to cache
        res_list = results or []
        _recall_cache[cache_key] = {'time': now, 'results': res_list}
        return res_list
    except Exception as e:
        print(f"[Cognee] recall failed: {e}")
        return []


# --------------------------------------------------
# IMPROVE
# --------------------------------------------------
async def cognee_improve(patient_id: str):
    try:
        await connect()
        import cognee
        try:
            await cognee.improve(dataset=_dataset(patient_id))
            print(f"[Cognee] improve() complete")
            clear_recall_cache(patient_id)
        except Exception:
            try:
                await cognee.memify(_dataset(patient_id))
                print(f"[Cognee] memify() complete")
            except Exception as e:
                print(f"[Cognee] improve/memify not available: {e}")
    except Exception as e:
        print(f"[Cognee] improve skipped: {e}")


# --------------------------------------------------
# FORGET
# --------------------------------------------------
async def cognee_forget(patient_id: str):
    await connect()
    import cognee
    try:
        await cognee.forget(dataset=_dataset(patient_id))
        print(f"[Cognee] forget() complete")
        clear_recall_cache(patient_id)
    except Exception as e:
        print(f"[Cognee] forget failed: {e}")
        raise

