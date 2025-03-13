import logging
import os
from concurrent.futures import ThreadPoolExecutor
from volatility3.framework import contexts, exceptions
from volatility3.framework.automagic import stacker
import volatility3.framework.interfaces.plugins as plugins
from app.core.db import SessionLocal
from app.models import MemoryAnalysis
import json
from celery import Celery

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app_celery = Celery("mini-forensic", broker="redis://localhost:6379/0")

def load_memory_dump(file_path):
    """Load a memory dump file with validation."""
    if not os.path.exists(file_path):
        logger.error(f"Memory dump file not found: {file_path}")
        raise FileNotFoundError(f"Memory dump file not found: {file_path}")
    try:
        context = contexts.Context()
        context.config['automagic.LayerStacker.single_location'] = f"file:{file_path}"
        stacker.run(context)
        logger.info(f"Loaded memory dump: {file_path}")
        return context
    except exceptions.VolatilityException as e:
        logger.error(f"Failed to load memory dump: {str(e)}")
        raise

def list_processes(context):
    """List processes as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.pslist.PsList')
    plugin.set_config_path('plugins.PsList')
    plugin.validate()
    grid = plugin.run()
    return [{"PID": row[0], "ProcessName": row[1], "PPID": row[2], "ImageFileName": row[3]} for row in grid]

def list_network_connections(context):
    """List network connections as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.netscan.NetScan')
    plugin.set_config_path('plugins.NetScan')
    plugin.validate()
    grid = plugin.run()
    return [{"LocalAddr": row[2], "RemoteAddr": row[3], "Protocol": row[1]} for row in grid]

def list_loaded_modules(context):
    """List loaded modules as a JSON-serializable list."""
    plugin = plugins.construct_plugin(context, 'windows.modules.Modules')
    plugin.set_config_path('plugins.Modules')
    plugin.validate()
    grid = plugin.run()
    return [{"BaseAddress": row[0], "ModuleName": row[1]} for row in grid]

@app_celery.task
def analyze_memory_task(file_path: str, file_id: int):
    context = load_memory_dump(file_path)
    processes = list_processes(context)
    network_connections = list_network_connections(context)
    loaded_modules = list_loaded_modules(context)

    result = {
        "processes": processes,
        "network_connections": network_connections,
        "loaded_modules": loaded_modules
    }

    db = SessionLocal()
    analysis = MemoryAnalysis(
        file_id=file_id,
        result_json=json.dumps(result)
    )
    db.add(analysis)
    db.commit()
    db.close()

    return result



if __name__ == "__main__":
    file_path = "../../../uploads/memory-dumps/win7_trial_1.vmem"
    result = analyze_memory_task(file_path)
    print("Processes:", result["processes"])
    print("Network Connections:", result["network_connections"])
    print("Loaded Modules:", result["loaded_modules"])